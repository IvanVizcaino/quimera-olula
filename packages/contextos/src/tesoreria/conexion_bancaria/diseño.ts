import { Criteria, Entidad, RespuestaLista } from "@olula/lib/diseño.ts";

/**
 * Nombre del proveedor bancario que gestiona esta conexión (p.ej. "plaid").
 * Solo hay un proveedor activo por instalación (ver `comun/banca.ts`), pero
 * se guarda por conexión tal cual lo devuelve el backend.
 */
export type ProveedorConexionBancaria = string;

/**
 * `activa`: la conexión funciona y puede sincronizarse.
 * `requiere_reautenticacion`: el consentimiento PSD2 caducó o el proveedor
 * devolvió un error de credenciales — hay que reautenticar con su widget.
 */
export type EstadoConexionBancaria = "activa" | "requiere_reautenticacion";

/**
 * Productos que se leen del banco. Algunos proveedores (Wealth Reader) cobran
 * por producto leído, así que cada conexión elige los suyos.
 */
export type TipoProductoBancario = "accounts" | "loans";

/**
 * Una cuenta que el proveedor expone dentro de una conexión. `cuentaBancoId`
 * es null hasta que se asocia a mano o el backend la casa automáticamente
 * por IBAN al crear la conexión.
 */
export interface CuentaConexionBancaria extends Entidad {
    id: string;
    idExterno: string;
    nombre: string;
    mascara: string | null;
    tipo: string | null;
    subtipo: string | null;
    iban: string | null;
    cuentaBancoId: string | null;
    descripcionCuentaBanco: string | null;
    activa: boolean;
}

export interface ConexionBancaria extends Entidad {
    id: string;
    proveedor: ProveedorConexionBancaria;
    institucionId: string | null;
    institucionNombre: string | null;
    estado: EstadoConexionBancaria;
    tiposProducto: TipoProductoBancario[];
    ultimaSincronizacion: Date | null;
    ultimoError: string | null;
    creadoEn: Date;
    cuentas: CuentaConexionBancaria[];
}

/** Cuota de un préstamo tal como la reporta el banco. */
export interface AmortizacionPrestamo extends Entidad {
    id: string;
    fecha: Date;
    capital: number;
    intereses: number;
    total: number;
    capitalPendiente: number | null;
    /** Cuota futura, aún sin cobrar. */
    programada: boolean;
    /** Asiento que la contabilizó al conciliar su cargo en la cuenta. */
    asientoId: number | null;
}

/**
 * Préstamo leído del banco (un producto `loans` de la conexión). Sus cuotas
 * se contabilizan al conciliar el cargo en la cuenta, con estas subcuentas.
 */
export interface PrestamoBancario extends Entidad {
    id: string;
    conexionId: string;
    cuentaConexionId: string;
    nombre: string;
    activa: boolean;
    contrato: string | null;
    tipo: string | null;
    divisa: string | null;
    capitalConcedido: number | null;
    capitalPendiente: number | null;
    cuota: number | null;
    cuentaVinculada: string | null;
    codigoSubcuentaCapital: string | null;
    codigoSubcuentaIntereses: string | null;
    cuotasSinContabilizar: number;
    amortizaciones: AmortizacionPrestamo[];
}

export type SubcuentasPrestamo = {
    codigoSubcuentaCapital: string;
    codigoSubcuentaIntereses: string;
};

export type GetPrestamosBancarios = (conexionId: string) => Promise<PrestamoBancario[]>;

export type GetPrestamoBancario = (id: string) => Promise<PrestamoBancario>;

export type PatchPrestamoBancario = (id: string, subcuentas: SubcuentasPrestamo) => Promise<void>;

export type PatchTiposProductoConexionBancaria = (
    id: string,
    tiposProducto: TipoProductoBancario[],
) => Promise<void>;

/**
 * Cambios que admite la asociación de una cuenta del banco con una cuenta
 * bancaria de la empresa (`cuentaBancoId: null` la desasocia).
 */
export type CambiosCuentaConexionBancaria = {
    cuentaBancoId: string | null;
    activa: boolean;
};

export type GetConexionBancaria = (id: string) => Promise<ConexionBancaria>;

export type GetConexionesBancarias = (criteria: Criteria) => RespuestaLista<ConexionBancaria>;

/**
 * Lo que devuelve el backend para iniciar una conexión con el proveedor
 * activo: qué proveedor es y los datos que necesita su UI (ver
 * comun/proveedor_bancario/) para completarla — para Plaid, un `link_token`.
 */
export type DatosInicioConexionBancaria = {
    proveedor: string;
    datos: Record<string, unknown>;
};

/**
 * `POST tesoreria/conexion_bancaria/iniciar`. Sin `conexionId`: alta de un
 * banco nuevo. Con `conexionId`: reautenticación de una conexión existente.
 * `tiposProducto`: los que se leen (por defecto, en un alta solo cuentas y al
 * reautenticar los de la conexión).
 */
export type PostIniciarConexionBancaria = (
    conexionId?: string,
    tiposProducto?: TipoProductoBancario[],
) => Promise<DatosInicioConexionBancaria>;

/**
 * Tras completar la reautenticación con el widget del proveedor: el backend
 * comprueba el acceso con `datos` y reactiva la conexión.
 */
export type PatchReautenticarConexionBancaria = (id: string, datos: Record<string, unknown>) => Promise<void>;

/**
 * Envía lo que devolvió el widget del proveedor al completar la conexión
 * (Plaid: `{ public_token }`). El backend hace el intercambio con el
 * proveedor, trae cuentas e IBAN y asocia automáticamente las cuentas cuyo
 * IBAN coincide con una cuenta bancaria de la empresa.
 */
export type PostConexionBancaria = (datos: Record<string, unknown>) => Promise<string>;

export type PatchCuentaConexionBancaria = (
    conexionId: string,
    cuentaId: string,
    cambios: CambiosCuentaConexionBancaria,
) => Promise<void>;

/**
 * Revoca el acceso en el proveedor y borra la conexión.
 */
export type DeleteConexionBancaria = (id: string) => Promise<void>;

/**
 * Saldo e info de una cuenta conectada (vía el proveedor bancario activo).
 * Independiente del proveedor concreto (Plaid, GoCardless…).
 */
export interface SaldoCuentaConexionBancaria {
    cuentaId: string;
    idExterno: string;
    nombre: string;
    mascara: string | null;
    tipo: string | null;
    subtipo: string | null;
    iban: string | null;
    cuentaBancoId: string | null;
    descripcionCuentaBanco: string | null;
    activa: boolean;
    saldoDisponible: number | null;
    saldoActual: number | null;
    saldoLimite: number | null;
    divisa: string | null;
    conexionId: string;
    institucionNombre: string | null;
    estadoConexion: EstadoConexionBancaria;
    consentimientoCaducaEn: Date | null;
    ultimaSincronizacion: Date | null;
    saldoActualizadoEn: Date | null;
    error: string | null;
}

export interface ResumenSaldosConexionBancaria {
    cuentas: SaldoCuentaConexionBancaria[];
    totalDisponible: number | null;
    totalActual: number | null;
    divisa: string | null;
    conexiones: number;
    conexionesConError: number;
    conexionesRequierenReautenticacion: number;
    /** True si el backend ha encolado (o debería) un refresco en segundo plano. */
    necesitaRefresco: boolean;
}

export type GetSaldosConexionBancaria = () => Promise<ResumenSaldosConexionBancaria>;

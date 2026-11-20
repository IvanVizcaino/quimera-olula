import { Modelo } from "@olula/lib/diseño.ts";

/** Importe tal como lo da la API: texto con dos decimales, sin IVA ("49.00"). */
export type Importe = string;
/** Fecha ISO (YYYY-MM-DD). */
export type FechaIso = string;

export type Periodicidad = "mensual" | "anual";

export type PrecioPeriodo = Record<Periodicidad, Importe>;

export type EstadoSuscripcionSaas =
    "prueba" | "activa" | "impagada" | "solo_lectura" | "finalizada";

// ----- Catálogo público -----

export type TipoLimite = "recuento" | "consumo_mensual";

export interface LimiteCatalogo {
    id: string;
    nombre: string;
    unidad: string;
    tipo: TipoLimite;
    orden: number;
}

export interface ModuloCatalogo {
    id: string;
    nombre: string;
    descripcion: string;
    dependeDe: string[];
    precio: PrecioPeriodo;
    contratableSuelto: boolean;
    orden: number;
}

export type ModoModuloPlan = "incluido" | "extra" | "no_disponible";

export interface ModuloPlan {
    moduloId: string;
    modo: ModoModuloPlan;
    /** Precio propio del plan para ese módulo extra; null = el del catálogo. */
    precio: PrecioPeriodo | null;
    opciones: Record<string, string>;
}

export interface LimitePlan {
    limiteId: string;
    /** null = ilimitado. */
    valor: number | null;
    ampliable: boolean;
}

export interface PlanCatalogo {
    id: string;
    nombre: string;
    descripcion: string;
    precio: PrecioPeriodo;
    diasPrueba: number;
    destacado: boolean;
    orden: number;
    modulos: ModuloPlan[];
    limites: LimitePlan[];
}

export interface ExtraCatalogo {
    id: string;
    nombre: string;
    descripcion: string;
    limiteId: string | null;
    cantidad: number;
    requiereModulo: string | null;
    precio: PrecioPeriodo;
    orden: number;
}

export interface Catalogo {
    limites: LimiteCatalogo[];
    modulos: ModuloCatalogo[];
    planes: PlanCatalogo[];
    extras: ExtraCatalogo[];
}

// ----- Suscripción de la empresa -----

/** Lo que se quiere contratar: plan, periodicidad, módulos extra y extras con cantidad. */
export interface Objetivo {
    planId: string;
    periodicidad: Periodicidad;
    modulos: string[];
    extras: Record<string, number>;
}

export interface LineaCuota {
    tipo: "plan" | "modulo" | "extra" | string;
    refId: string;
    concepto: string;
    cantidad: number;
    precioUnitario: Importe;
    importe: Importe;
}

export interface Cuota {
    periodicidad: Periodicidad;
    base: Importe;
    descuento: Importe;
    total: Importe;
    lineas: LineaCuota[];
}

export interface Suscripcion {
    id: string;
    planId: string;
    periodicidad: Periodicidad;
    estado: EstadoSuscripcionSaas;
    inicioPeriodo: FechaIso;
    finPeriodo: FechaIso;
    finPrueba: FechaIso | null;
    impagadaDesde: FechaIso | null;
    cambioProgramado: Objetivo | null;
    cancelarAlFin: boolean;
    tieneMetodoPago: boolean;
    descuentoPct: string;
    modulos: string[];
    extras: Record<string, number>;
}

export interface DerechoModulo {
    id: string;
    nombre: string;
    origen: "plan" | "extra" | "cortesia" | string;
}

export interface DerechoLimite {
    id: string;
    nombre: string;
    unidad: string;
    tipo: TipoLimite;
    /** null = ilimitado. */
    valor: number | null;
    uso: number;
}

export interface Derechos {
    modulos: DerechoModulo[];
    limites: DerechoLimite[];
    soloLectura: boolean;
}

export interface Factura {
    id: string;
    periodoDesde: FechaIso;
    periodoHasta: FechaIso;
    concepto: string;
    base: Importe;
    iva: Importe;
    total: Importe;
    estado: string;
    numeroFactura: string | null;
    urlPdf: string | null;
}

export interface MandatoSepa {
    referencia: string;
    titular: string;
    /** Ya enmascarado por la API (…1234). */
    iban: string;
    fechaFirma: string;
}

export interface MiSuscripcion {
    suscripcion: Suscripcion | null;
    plan: PlanCatalogo | null;
    cuota: Cuota | null;
    cuotaProgramada: Cuota | null;
    derechos: Derechos;
    facturas: Factura[];
    mandatoSepa: MandatoSepa | null;
}

// ----- Presupuesto y cambio -----

export interface Exceso {
    limiteId: string;
    nombre: string;
    uso: number;
    limite: number;
}

export type EfectoCambio = "inmediato" | "fin_periodo";

export interface Presupuesto {
    objetivo: Objetivo;
    cuotaActual: Cuota | null;
    cuotaNueva: Cuota;
    efecto: EfectoCambio;
    fechaEfecto: FechaIso;
    prorrateo: Importe;
    aplicable: boolean;
    avisos: string[];
    excesos: Exceso[];
}

export interface ResultadoCambio {
    suscripcion: Suscripcion;
    presupuesto: Presupuesto;
    requierePago: boolean;
}

export interface ResultadoPago {
    url: string | null;
    pasarelaId: string;
    necesitaMandato: boolean;
}

export interface NuevoMandato extends Modelo {
    titular: string;
    iban: string;
}

export type GetMiSuscripcion = () => Promise<MiSuscripcion>;
export type GetCatalogo = () => Promise<Catalogo>;
export type PostPresupuesto = (objetivo: Objetivo) => Promise<Presupuesto>;
export type PostCambiar = (objetivo: Objetivo) => Promise<ResultadoCambio>;
export type PostPagar = (urlOk: string, urlCancelado: string) => Promise<ResultadoPago>;
export type PostMandatoSepa = (mandato: NuevoMandato) => Promise<void>;
export type PostPortal = (urlVuelta: string) => Promise<string | null>;
export type PostCancelar = (cancelar: boolean) => Promise<void>;

// ----- Aviso global (whoami.saas.suscripcion) -----

export interface SuscripcionWhoami {
    planId: string;
    plan: string;
    estado: EstadoSuscripcionSaas;
    finPrueba: FechaIso | null;
    finPeriodo: FechaIso | null;
    cancelarAlFin: boolean;
    tieneMetodoPago: boolean;
}

export type VarianteAviso = "info" | "advertencia" | "error";

export interface AvisoSuscripcion {
    variante: VarianteAviso;
    mensaje: string;
    accion: string;
}

// ----- Máquina de la página -----

export type EstadoPaginaSuscripcion =
    | "CARGANDO"
    | "ERROR"
    | "SIN_SUSCRIPCION"
    | "ABIERTA"
    | "PIDIENDO_MANDATO"
    | "CONFIRMANDO_CANCELACION";

export type ContextoPaginaSuscripcion = {
    estado: EstadoPaginaSuscripcion;
    mi: MiSuscripcion | null;
    catalogo: Catalogo | null;
    /** Texto del fallo de carga (estado ERROR). */
    error: string;
    /** Confirmación tras una acción (cambio aplicado, pago correcto...). */
    aviso: string;
};

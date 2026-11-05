import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

export type TipoCuentasAnuales =
    | "Situacion"
    | "Perdidas y ganancias"
    | "Ingresos y gastos";

export type FormatoCuentasAnuales = "Normal" | "Abreviado";

export type NivelDesglose = "No desglosar" | "Cuenta" | "Subcuenta";

export type FormatoHoja = "xlsx" | "ods";

/**
 * Ficha guardada del informe (Eneboo `co_i_cuentasanuales`).
 *
 * Plana a propósito: la API agrupa las fechas en `periodo` y
 * `periodo_anterior`, pero aquí los campos se editan sueltos en el formulario
 * y el anidamiento queda como detalle de `infraestructura.ts`. El ejercicio
 * anterior es opcional: vacío significa informe de una sola columna.
 */
export interface CuentasAnuales extends Entidad {
    id: string;
    descripcion: string;
    tipo: TipoCuentasAnuales;
    formato: FormatoCuentasAnuales;
    nivelDesglose: NivelDesglose;
    ejercicioId: string;
    fechaDesde: string;
    fechaHasta: string;
    ejercicioAnteriorId: string;
    fechaDesdeAnterior: string;
    fechaHastaAnterior: string;
    omitirEpigrafesSinSaldo: boolean;
}

/** Detalle de una línea por cuenta o por subcuenta. */
export interface DesgloseCuentasAnuales {
    clave: string;
    descripcion: string;
    saldoActual: number;
    saldoAnterior: number;
}

/** Línea del modelo de cuentas anuales con su saldo calculado. */
export interface LineaCuentasAnuales {
    codbalance: string;
    naturaleza: string;
    nivel1: string;
    nivel2: number | null;
    descripcion1: string;
    descripcion2: string;
    descripcion3: string;
    descripcion4: string;
    saldoActual: number;
    saldoAnterior: number;
    desglose: DesgloseCuentasAnuales[];
}

/** Bloques A.1..A.5 (o A..D en abreviado) de la cuenta de resultados. */
export interface SubtotalCuentasAnuales {
    codigo: string;
    descripcion: string;
    saldoActual: number;
    saldoAnterior: number;
    despuesDeNivel2: number;
}

export interface TotalGrupoCuentasAnuales {
    clave: string;
    descripcion: string;
    saldoActual: number;
    saldoAnterior: number;
}

/** Subcuenta con movimiento cuya cuenta no está en ninguna línea del modelo:
 * sus importes no aparecen en el informe. */
export interface AvisoCuentaSinBalance {
    codigoSubcuenta: string;
    codigoCuenta: string;
    debe: number;
    haber: number;
}

export interface BalanceCuentasAnuales {
    datos: LineaCuentasAnuales[];
    total: number;
    subtotales: SubtotalCuentasAnuales[];
    totalesGrupo: TotalGrupoCuentasAnuales[];
    avisosSinCodigoBalance: AvisoCuentaSinBalance[];
}

export interface NuevaCuentasAnuales extends Modelo {
    descripcion: string;
    tipo: TipoCuentasAnuales;
    formato: FormatoCuentasAnuales;
    nivelDesglose: NivelDesglose;
    ejercicioId: string;
    fechaDesde: string;
    fechaHasta: string;
    ejercicioAnteriorId: string;
    fechaDesdeAnterior: string;
    fechaHastaAnterior: string;
}

/** Los tres campos de un periodo viajan juntos: la API los agrupa en un
 * objeto, así que se mandan siempre los tres aunque solo cambie uno. */
export type CambiosCuentasAnuales = Partial<
    Pick<
        CuentasAnuales,
        | "descripcion"
        | "tipo"
        | "formato"
        | "nivelDesglose"
        | "omitirEpigrafesSinSaldo"
        | "ejercicioId"
        | "fechaDesde"
        | "fechaHasta"
        | "ejercicioAnteriorId"
        | "fechaDesdeAnterior"
        | "fechaHastaAnterior"
    >
>;

export type GetListaCuentasAnuales = (
    criteria: Criteria
) => RespuestaLista<CuentasAnuales>;
export type GetCuentasAnuales = (id: string) => Promise<CuentasAnuales>;
export type GetBalanceCuentasAnuales = (
    id: string
) => Promise<BalanceCuentasAnuales>;
export type PostCuentasAnuales = (
    nuevo: NuevaCuentasAnuales
) => Promise<string>;
export type PatchCuentasAnuales = (
    id: string,
    cambios: CambiosCuentasAnuales
) => Promise<void>;
export type DeleteCuentasAnuales = (id: string) => Promise<void>;
export type GetReportCuentasAnuales = (id: string) => Promise<Blob>;
export type GetHojaCuentasAnuales = (
    id: string,
    formato: FormatoHoja
) => Promise<Blob>;

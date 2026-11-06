import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

/** Literales de `co_i_diario.ordenN`. No se traducen: son los que guarda
 * Eneboo y con los que habla la API. */
export type CriterioOrden =
    | "No ordenar"
    | "Asiento"
    | "Fecha"
    | "Subcuenta";

export type SentidoOrden = "Ascendente" | "Descendente";

/**
 * Ficha guardada del informe (Eneboo `co_i_diario`).
 *
 * Plana a propósito: la API agrupa los rangos en `asientos`/`subcuentas` y los
 * criterios de orden en una lista, pero aquí los campos se editan sueltos en
 * el formulario, igual que en el ERP, y el anidamiento queda como detalle de
 * `infraestructura.ts`.
 *
 * `tipo` no tiene control en el formulario de Eneboo (siempre «Borrador»);
 * viaja para que la ficha siga siendo legible desde el escritorio.
 */
export interface LibroDiario extends Entidad {
    id: string;
    descripcion: string;
    tipo: string;
    ejercicioId: string;
    fechaDesde: string;
    fechaHasta: string;
    todosAsientos: boolean;
    asientoDesde: string;
    asientoHasta: string;
    todasSubcuentas: boolean;
    subcuentaDesde: string;
    subcuentaHasta: string;
    datosIva: boolean;
    agruparMeses: boolean;
    resumenMensual: boolean;
    orden1: CriterioOrden;
    tipoOrden1: SentidoOrden;
    orden2: CriterioOrden;
    tipoOrden2: SentidoOrden;
    orden3: CriterioOrden;
    tipoOrden3: SentidoOrden;
}

/** Una partida del libro. Los campos de I.V.A. solo vienen con «Datos de
 * I.V.A.» marcado (informes `co_i_diario_*_iva`). */
export interface LineaLibroDiario extends Entidad {
    id: string;
    partidaId: number;
    asientoId: number;
    asientoNumero: number;
    fecha: Date;
    conceptoAsiento: string;
    codigoSubcuenta: string;
    descripcionSubcuenta: string;
    concepto: string;
    documento: string;
    debe: number;
    haber: number;
    baseImponible: number | null;
    codigoSerie: string | null;
    factura: number | null;
    iva: number | null;
    recargo: number | null;
}

export interface TotalesLibroDiario {
    debe: number;
    haber: number;
    descuadre: number;
}

export interface TotalMesLibroDiario extends TotalesLibroDiario {
    mes: string;
}

export interface LineaResumenMensual {
    codigoSubcuenta: string;
    descripcionSubcuenta: string;
    debe: number;
    haber: number;
}

/** Bloque de `co_i_diariomen_res`: APERTURA, ENERO..DICIEMBRE,
 * REGULARIZACION y CIERRE. */
export interface PeriodoResumenMensual {
    indice: number;
    titulo: string;
    lineas: LineaResumenMensual[];
    totalDebe: number;
    totalHaber: number;
    acumuladoDebe: number;
    acumuladoHaber: number;
}

export interface ResultadoLibroDiario {
    datos: LineaLibroDiario[];
    total: number;
    totales: TotalesLibroDiario | null;
    totalesMes: TotalMesLibroDiario[];
    resumenMensual: PeriodoResumenMensual[];
}

export interface NuevoLibroDiario extends Modelo {
    descripcion: string;
    ejercicioId: string;
    fechaDesde: string;
    fechaHasta: string;
    todosAsientos: boolean;
    asientoDesde: string;
    asientoHasta: string;
    todasSubcuentas: boolean;
    subcuentaDesde: string;
    subcuentaHasta: string;
    datosIva: boolean;
    agruparMeses: boolean;
    resumenMensual: boolean;
    orden1: CriterioOrden;
    tipoOrden1: SentidoOrden;
}

/** Los campos de un rango viajan juntos aunque solo cambie uno: la API recibe
 * el rango como objeto completo. Lo mismo con los tres niveles de orden. */
export type CambiosLibroDiario = Partial<
    Pick<
        LibroDiario,
        | "descripcion"
        | "ejercicioId"
        | "fechaDesde"
        | "fechaHasta"
        | "todosAsientos"
        | "asientoDesde"
        | "asientoHasta"
        | "todasSubcuentas"
        | "subcuentaDesde"
        | "subcuentaHasta"
        | "datosIva"
        | "agruparMeses"
        | "resumenMensual"
        | "orden1"
        | "tipoOrden1"
        | "orden2"
        | "tipoOrden2"
        | "orden3"
        | "tipoOrden3"
    >
>;

export type GetListaLibroDiario = (
    criteria: Criteria
) => RespuestaLista<LibroDiario>;
export type GetLibroDiario = (id: string) => Promise<LibroDiario>;
export type GetResultadoLibroDiario = (
    id: string
) => Promise<ResultadoLibroDiario>;
export type PostLibroDiario = (nuevo: NuevoLibroDiario) => Promise<string>;
/** Recibe el informe entero, no solo el id: los rangos y los niveles de
 * orden viajan completos aunque solo cambie una pieza. */
export type PatchLibroDiario = (
    informe: LibroDiario,
    cambios: CambiosLibroDiario
) => Promise<void>;
export type DeleteLibroDiario = (id: string) => Promise<void>;
export type GetReportLibroDiario = (id: string) => Promise<Blob>;

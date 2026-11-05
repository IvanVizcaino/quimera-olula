import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";
import { SentidoOrden } from "#/contabilidad/libro_diario/diseño.ts";

export type { SentidoOrden };

/** `co_i_mayor.orden1` solo ofrece estos dos, no los cuatro del diario. */
export type CriterioOrdenMayor = "Asiento" | "Fecha";

/**
 * Ficha guardada del informe (Eneboo `co_i_mayor`).
 *
 * Plana a propósito: la API agrupa el rango en `subcuentas` y el criterio en
 * `orden`, pero aquí los campos se editan sueltos en el formulario, igual que
 * en el ERP, y el anidamiento queda como detalle de `infraestructura.ts`.
 */
export interface LibroMayor extends Entidad {
    id: string;
    descripcion: string;
    ejercicioId: string;
    fechaDesde: string;
    fechaHasta: string;
    todasSubcuentas: boolean;
    subcuentaDesde: string;
    subcuentaHasta: string;
    saldoInicial: boolean;
    excluirPartidasCero: boolean;
    orden: CriterioOrdenMayor;
    tipoOrden: SentidoOrden;
}

export interface LineaLibroMayor extends Entidad {
    id: string;
    partidaId: number;
    asientoId: number;
    asientoNumero: number;
    fecha: Date;
    concepto: string;
    debe: number;
    haber: number;
    saldo: number;
}

export interface CabeceraLibroMayor {
    subcuentaId: number;
    codigoSubcuenta: string;
    descripcionSubcuenta: string;
    saldoInicial: number;
    saldoFinal: number;
}

/** El mayor de una subcuenta. El informe trae uno por cada subcuenta del
 * rango, que es lo que imprime el PDF de Eneboo. */
export interface BloqueLibroMayor {
    cabecera: CabeceraLibroMayor;
    lineas: LineaLibroMayor[];
    total: number;
    totalDebe: number;
    totalHaber: number;
}

export interface ResultadoLibroMayor {
    subcuentas: BloqueLibroMayor[];
}

export interface NuevoLibroMayor extends Modelo {
    descripcion: string;
    ejercicioId: string;
    fechaDesde: string;
    fechaHasta: string;
    todasSubcuentas: boolean;
    subcuentaDesde: string;
    subcuentaHasta: string;
    saldoInicial: boolean;
    excluirPartidasCero: boolean;
    orden: CriterioOrdenMayor;
    tipoOrden: SentidoOrden;
}

/** Los campos del rango y los del orden viajan juntos aunque solo cambie
 * uno: la API los recibe como objeto, no campo a campo. */
export type CambiosLibroMayor = Partial<
    Pick<
        LibroMayor,
        | "descripcion"
        | "ejercicioId"
        | "fechaDesde"
        | "fechaHasta"
        | "todasSubcuentas"
        | "subcuentaDesde"
        | "subcuentaHasta"
        | "saldoInicial"
        | "excluirPartidasCero"
        | "orden"
        | "tipoOrden"
    >
>;

export type GetListaLibroMayor = (
    criteria: Criteria
) => RespuestaLista<LibroMayor>;
export type GetLibroMayor = (id: string) => Promise<LibroMayor>;
export type GetResultadoLibroMayor = (
    id: string
) => Promise<ResultadoLibroMayor>;
export type PostLibroMayor = (nuevo: NuevoLibroMayor) => Promise<string>;
/** Recibe el informe entero, no solo el id: el rango y el orden viajan
 * completos aunque solo cambie una pieza. */
export type PatchLibroMayor = (
    informe: LibroMayor,
    cambios: CambiosLibroMayor
) => Promise<void>;
export type DeleteLibroMayor = (id: string) => Promise<void>;
export type GetReportLibroMayor = (id: string) => Promise<Blob>;

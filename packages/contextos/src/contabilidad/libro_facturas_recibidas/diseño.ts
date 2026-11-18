import {
    FiltroIva,
    PresentacionIva,
    ResultadoLibroIva,
} from "#/contabilidad/comun/librosIva.ts";
import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

export type { ResultadoLibroIva };

/**
 * Ficha guardada del informe (Eneboo `co_i_facturasrec`).
 *
 * Plana a propósito: la API agrupa el filtro y las opciones de presentación
 * en sendos objetos, pero aquí los campos se editan sueltos en el
 * formulario, igual que en el ERP.
 */
export interface LibroFacturasRecibidas extends Entidad, FiltroIva,
    PresentacionIva {
    id: string;
    descripcion: string;
    ejercicioId: string;
    fechaDesde: string;
    fechaHasta: string;
    /** `codserie`: solo las recibidas se pueden limitar a una serie. */
    codigoSerie: string;
}

export interface NuevoLibroFacturasRecibidas extends Modelo, FiltroIva,
    PresentacionIva {
    descripcion: string;
    ejercicioId: string;
    fechaDesde: string;
    fechaHasta: string;
    codigoSerie: string;
}

/** Los campos del filtro y los de presentación viajan juntos aunque solo
 * cambie uno: la API los recibe como objeto, no campo a campo. */
export type CambiosLibroFacturasRecibidas = Partial<
    Pick<
        LibroFacturasRecibidas,
        | "descripcion"
        | "ejercicioId"
        | "fechaDesde"
        | "fechaHasta"
        | "todos"
        | "porcentaje"
        | "conIva"
        | "mostrarTotalFactura"
        | "mostrarNif"
        | "mostrarDocumento"
        | "mostrarAsiento"
        | "numeracionAutomatica"
        | "numeroDesde"
        | "codigoSerie"
    >
>;

export type GetListaLibroFacturasRecibidas = (
    criteria: Criteria
) => RespuestaLista<LibroFacturasRecibidas>;
export type GetLibroFacturasRecibidas = (
    id: string
) => Promise<LibroFacturasRecibidas>;
export type GetResultadoLibroFacturasRecibidas = (
    id: string
) => Promise<ResultadoLibroIva>;
export type PostLibroFacturasRecibidas = (
    nuevo: NuevoLibroFacturasRecibidas
) => Promise<string>;
/** Recibe el informe entero, no solo el id: el filtro y la presentación
 * viajan completos aunque solo cambie una pieza. */
export type PatchLibroFacturasRecibidas = (
    informe: LibroFacturasRecibidas,
    cambios: CambiosLibroFacturasRecibidas
) => Promise<void>;
export type DeleteLibroFacturasRecibidas = (id: string) => Promise<void>;
export type GetReportLibroFacturasRecibidas = (id: string) => Promise<Blob>;

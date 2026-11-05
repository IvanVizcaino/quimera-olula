import {
    FiltroIva,
    PresentacionIva,
    ResultadoLibroIva,
} from "#/contabilidad/comun/librosIva.ts";
import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

export type { ResultadoLibroIva };

/**
 * Ficha guardada del informe (Eneboo `co_i_facturasemi`).
 *
 * Plana a propósito: la API agrupa el filtro y las opciones de presentación
 * en sendos objetos, pero aquí los campos se editan sueltos en el
 * formulario, igual que en el ERP.
 */
export interface LibroFacturasEmitidas extends Entidad, FiltroIva,
    PresentacionIva {
    id: string;
    descripcion: string;
    ejercicioId: string;
    fechaDesde: string;
    fechaHasta: string;
}

export interface NuevoLibroFacturasEmitidas extends Modelo, FiltroIva,
    PresentacionIva {
    descripcion: string;
    ejercicioId: string;
    fechaDesde: string;
    fechaHasta: string;
}

/** Los campos del filtro y los de presentación viajan juntos aunque solo
 * cambie uno: la API los recibe como objeto, no campo a campo. */
export type CambiosLibroFacturasEmitidas = Partial<
    Pick<
        LibroFacturasEmitidas,
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
    >
>;

export type GetListaLibroFacturasEmitidas = (
    criteria: Criteria
) => RespuestaLista<LibroFacturasEmitidas>;
export type GetLibroFacturasEmitidas = (
    id: string
) => Promise<LibroFacturasEmitidas>;
export type GetResultadoLibroFacturasEmitidas = (
    id: string
) => Promise<ResultadoLibroIva>;
export type PostLibroFacturasEmitidas = (
    nuevo: NuevoLibroFacturasEmitidas
) => Promise<string>;
/** Recibe el informe entero, no solo el id: el filtro y la presentación
 * viajan completos aunque solo cambie una pieza. */
export type PatchLibroFacturasEmitidas = (
    informe: LibroFacturasEmitidas,
    cambios: CambiosLibroFacturasEmitidas
) => Promise<void>;
export type DeleteLibroFacturasEmitidas = (id: string) => Promise<void>;
export type GetReportLibroFacturasEmitidas = (id: string) => Promise<Blob>;

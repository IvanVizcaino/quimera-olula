/**
 * Producción > Listado de trabajadores (`pr_i_trabajadores` de Eneboo): trabajadores por
 * sección, con filtros por parámetros (sin ficha guardada). Regla `produccion.trabajador`.
 */

export type FormatoHoja = "xlsx" | "ods";

/** Códigos de trabajador desde/hasta y sección; vacíos, sin filtro. */
export interface FiltroListadoTrabajadores {
    desde: string;
    hasta: string;
    seccionId: string;
}

export interface TrabajadorListado {
    id: string;
    nombre: string;
    deBaja: boolean;
}

export interface GrupoSeccion {
    /** `null`: los que no tienen sección («Sin sección», al final). */
    seccionId: string | null;
    seccion: string;
    trabajadores: TrabajadorListado[];
    total: number;
}

export interface ListadoTrabajadores {
    titulo: string;
    subtitulo: string;
    grupos: GrupoSeccion[];
    total: number;
}

export type GetListadoTrabajadores = (filtro: FiltroListadoTrabajadores) => Promise<ListadoTrabajadores>;
export type GetReportTrabajadores = (filtro: FiltroListadoTrabajadores) => Promise<Blob>;
export type GetHojaTrabajadores = (filtro: FiltroListadoTrabajadores, formato: FormatoHoja) => Promise<Blob>;

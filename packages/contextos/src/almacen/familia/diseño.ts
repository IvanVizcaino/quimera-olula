import { Entidad, Filtro, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";

export interface Familia extends Entidad {
    id: string;
    descripcion: string;
    /** Unidad de peso o medida por defecto de sus artículos ("" si no tiene). Plugin pesos_medidas. */
    unidadId: string;
}

export interface FamiliaAPI extends Entidad {
    id: string;
    descripcion: string;
    unidad_id?: string | null;
}

export type GetFamilia = (id: string) => Promise<Familia>;
export type GetFamilias = (
    filtro: Filtro,
    orden: Orden,
    paginacion?: Paginacion
) => RespuestaLista<Familia>;

export type PostFamilia = (modulo: Partial<Familia>) => Promise<string>;
export type PatchFamilia = (id: string, modulo: Partial<Familia>) => Promise<void>;
export type DeleteFamilia = (id: string) => Promise<void>;

export type NuevaFamilia = {
    id: string;
    descripcion: string;
    unidadId: string;
};
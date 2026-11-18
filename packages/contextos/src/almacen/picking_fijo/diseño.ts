import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

export interface PickingFijo extends Entidad {
    id: string;
    articuloId: string;
    articulo: string;
    ubicacionId: string;
    ubicacion: string;
    almacenId: string;
    minimo: number;
    maximo: number;
    unidadReposicion: number;
    stock: number;
}

export interface NuevoPickingFijo extends Modelo {
    articuloId: string;
    ubicacionId: string;
    minimo: number;
    maximo: number;
    unidadReposicion: number;
}

export type CambiosPickingFijo = Partial<Pick<PickingFijo, "minimo" | "maximo" | "unidadReposicion">>;

export type GetPickingFijo = (id: string) => Promise<PickingFijo>;
export type GetPickingsFijos = (criteria: Criteria) => RespuestaLista<PickingFijo>;
export type PostPickingFijo = (nuevo: NuevoPickingFijo) => Promise<string>;
export type PatchPickingFijo = (id: string, cambios: CambiosPickingFijo) => Promise<void>;
export type DeletePickingFijo = (id: string) => Promise<void>;

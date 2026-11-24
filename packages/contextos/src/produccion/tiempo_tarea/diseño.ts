import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

/**
 * Tiempo de una tarea de un tipo de proceso en un tipo de centro de coste y, si se indica, para
 * un artículo (`pr_costestarea`; Eneboo lo llama «coste»). En minutos: `costeInicial` es el
 * tiempo fijo de preparación y `costeUnidad` el tiempo por unidad. `id` es el serial, en texto.
 */
export interface TiempoTarea extends Entidad {
    id: string;
    tipoCentroId: string;
    tipoCentro: string;
    tareaProcesoId: string;
    /** Descripción de la tarea. */
    tarea: string;
    codigoTarea: string;
    tipoProcesoId: string;
    tipoProceso: string;
    /** Vacío: vale para cualquier artículo. */
    articuloId: string;
    articulo: string;
    costeInicial: number | null;
    costeUnidad: number | null;
}

export interface NuevoTiempoTarea extends Modelo {
    tipoCentroId: string;
    tareaProcesoId: string;
    articuloId: string;
    articulo: string;
    costeInicial: number | null;
    costeUnidad: number | null;
}

export type CambiosTiempoTarea = Partial<Pick<TiempoTarea,
    "tipoCentroId" | "tareaProcesoId" | "articuloId" | "costeInicial" | "costeUnidad">>;

export type GetTiempoTarea = (id: string) => Promise<TiempoTarea>;
export type GetTiemposTarea = (criteria: Criteria) => RespuestaLista<TiempoTarea>;
export type GetTiemposTipoCentro = (tipoCentroId: string, criteria: Criteria) => RespuestaLista<TiempoTarea>;
export type PostTiempoTarea = (nuevo: NuevoTiempoTarea) => Promise<string>;
export type PatchTiempoTarea = (id: string, cambios: CambiosTiempoTarea) => Promise<void>;
export type DeleteTiempoTarea = (id: string) => Promise<void>;

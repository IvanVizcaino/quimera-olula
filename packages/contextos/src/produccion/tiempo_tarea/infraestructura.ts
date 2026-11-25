import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import {
    CambiosTiempoTarea,
    DeleteTiempoTarea,
    GetTiemposTarea,
    GetTiemposTipoCentro,
    GetTiempoTarea,
    NuevoTiempoTarea,
    PatchTiempoTarea,
    PostTiempoTarea,
    TiempoTarea,
} from "./diseño.ts";

const baseUrl = `/produccion/tiempo_tarea`;

export interface TiempoTareaApi {
    id: string | number;
    tipo_centro_id: string;
    tipo_centro: string | null;
    tarea_proceso_id: string | number;
    tarea: string | null;
    codigo_tarea: string | null;
    tipo_proceso_id: string | null;
    tipo_proceso: string | null;
    articulo_id: string | null;
    articulo: string | null;
    coste_inicial: number | null;
    coste_unidad: number | null;
}

type CambiosTiempoTareaApi = {
    tipo_centro_id?: string;
    tarea_proceso_id?: string;
    articulo_id?: string | null;
    coste_inicial?: number | null;
    coste_unidad?: number | null;
};

export const tiempoTareaDesdeApi = (api: TiempoTareaApi): TiempoTarea => ({
    id: String(api.id),
    tipoCentroId: api.tipo_centro_id ?? "",
    tipoCentro: api.tipo_centro ?? "",
    tareaProcesoId: String(api.tarea_proceso_id ?? ""),
    tarea: api.tarea ?? "",
    codigoTarea: api.codigo_tarea ?? "",
    tipoProcesoId: api.tipo_proceso_id ?? "",
    tipoProceso: api.tipo_proceso ?? "",
    articuloId: api.articulo_id ?? "",
    articulo: api.articulo ?? "",
    costeInicial: api.coste_inicial ?? null,
    costeUnidad: api.coste_unidad ?? null,
});

const numeroONull = (n: number | string | null | undefined): number | null =>
    n === null || n === undefined || n === "" ? null : Number(n);

/** El artículo vacío es `null` (el tiempo vale para todos). */
export const cambiosTiempoTareaAApi = (c: CambiosTiempoTarea): CambiosTiempoTareaApi => {
    const cambios: CambiosTiempoTareaApi = {};
    if (c.tipoCentroId !== undefined) cambios.tipo_centro_id = c.tipoCentroId;
    if (c.tareaProcesoId !== undefined) cambios.tarea_proceso_id = c.tareaProcesoId;
    if (c.articuloId !== undefined) cambios.articulo_id = c.articuloId?.trim() || null;
    if (c.costeInicial !== undefined) cambios.coste_inicial = numeroONull(c.costeInicial);
    if (c.costeUnidad !== undefined) cambios.coste_unidad = numeroONull(c.costeUnidad);
    return cambios;
};

const url = (id: string) => `${baseUrl}/${encodeURIComponent(id)}`;

export const getTiempoTarea: GetTiempoTarea = async (id) =>
    RestAPI.getItem<TiempoTarea, TiempoTareaApi>(url(id), tiempoTareaDesdeApi);

export const getTiemposTarea: GetTiemposTarea = async (criteria: Criteria) =>
    RestAPI.getQuery<TiempoTarea, TiempoTareaApi>(baseUrl, criteria, tiempoTareaDesdeApi);

export const getTiemposTipoCentro: GetTiemposTipoCentro = async (tipoCentroId, criteria) =>
    RestAPI.getQuery<TiempoTarea, TiempoTareaApi>(
        `${baseUrl}/tipo_centro/${encodeURIComponent(tipoCentroId)}`, criteria, tiempoTareaDesdeApi);

export const postTiempoTarea: PostTiempoTarea = async (nuevo: NuevoTiempoTarea) => {
    const respuesta = await RestAPI.post(baseUrl, cambiosTiempoTareaAApi(nuevo), "Error al crear el tiempo de tarea");
    return String(respuesta.id);
};

export const patchTiempoTarea: PatchTiempoTarea = async (id, cambios) => {
    await RestAPI.patch(url(id), cambiosTiempoTareaAApi(cambios), "Error al guardar el tiempo de tarea");
};

export const deleteTiempoTarea: DeleteTiempoTarea = async (id) => {
    await RestAPI.delete(url(id), "Error al borrar el tiempo de tarea");
};

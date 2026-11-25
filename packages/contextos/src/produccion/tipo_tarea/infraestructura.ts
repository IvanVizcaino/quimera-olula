import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import {
    CambiosTipoTarea,
    DeleteTipoTarea,
    GetTipoTarea,
    GetTiposTarea,
    NuevoTipoTarea,
    PatchTipoTarea,
    PostTipoTarea,
    TipoTarea,
} from "./diseño.ts";

const baseUrl = `/produccion/tipo_tarea`;

export interface TipoTareaApi {
    id: string;
    descripcion: string | null;
    tiempo_medio: number | null;
}

export const tipoTareaDesdeApi = (api: TipoTareaApi): TipoTarea => ({
    id: api.id,
    descripcion: api.descripcion ?? "",
    tiempoMedio: api.tiempo_medio ?? null,
});

/** El tiempo vacío se manda como 0 (el servidor también lo guarda así). */
export const cambiosTipoTareaAApi = (c: CambiosTipoTarea): { descripcion?: string; tiempo_medio?: number } => {
    const cambios: { descripcion?: string; tiempo_medio?: number } = {};
    if (c.descripcion !== undefined) cambios.descripcion = c.descripcion ?? "";
    if (c.tiempoMedio !== undefined) cambios.tiempo_medio = Number(c.tiempoMedio) || 0;
    return cambios;
};

const url = (id: string) => `${baseUrl}/${encodeURIComponent(id)}`;

export const getTipoTarea: GetTipoTarea = async (id) =>
    RestAPI.getItem<TipoTarea, TipoTareaApi>(url(id), tipoTareaDesdeApi);

export const getTiposTarea: GetTiposTarea = async (criteria: Criteria) =>
    RestAPI.getQuery<TipoTarea, TipoTareaApi>(baseUrl, criteria, tipoTareaDesdeApi);

export const postTipoTarea: PostTipoTarea = async (nuevo: NuevoTipoTarea) => {
    const respuesta = await RestAPI.post(
        baseUrl,
        { id: nuevo.id.trim(), ...cambiosTipoTareaAApi(nuevo) },
        "Error al crear el tipo de tarea");
    return respuesta.id;
};

export const patchTipoTarea: PatchTipoTarea = async (id, cambios) => {
    await RestAPI.patch(url(id), cambiosTipoTareaAApi(cambios), "Error al guardar el tipo de tarea");
};

export const deleteTipoTarea: DeleteTipoTarea = async (id) => {
    await RestAPI.delete(url(id), "Error al borrar el tipo de tarea");
};

import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ComunUrls from "../urls.ts";
import { CambiosIaMemoria, DeleteIaMemoria, GetIaMemoria, GetIaMemorias, IaMemoria, NuevaIaMemoria, PatchIaMemoria, PostIaMemoria } from "./diseño.ts";

/**
 * Forma de la entidad tal como la devuelve la API (snake_case).
 */
export interface IaMemoriaApi {
    id: string;
    titulo: string;
    contenido: string;
    activo: boolean;
    creado_por: string;
    creado_en: string;
    actualizado_en: string;
}

interface NuevaIaMemoriaApi {
    titulo: string;
    contenido: string;
}

type CambiosIaMemoriaApi = Partial<{
    titulo: string;
    contenido: string;
    activo: boolean;
}>;

const baseUrl = new ComunUrls().IA_MEMORIA;

/**
 * Mapea respuesta de API a interfaz del dominio.
 * Convierte snake_case a camelCase y strings de fecha a Date.
 */
export const iaMemoriaDesdeApi = (api: IaMemoriaApi): IaMemoria => ({
    id: api.id,
    titulo: api.titulo,
    contenido: api.contenido,
    activo: api.activo,
    creadoPor: api.creado_por,
    creadoEn: new Date(Date.parse(api.creado_en)),
    actualizadoEn: new Date(Date.parse(api.actualizado_en)),
});

/**
 * Mapea datos de creación de dominio a API.
 */
export const nuevaIaMemoriaAApi = (m: NuevaIaMemoria): NuevaIaMemoriaApi => ({
    titulo: m.titulo,
    contenido: m.contenido,
});

const cambiosIaMemoriaAApi = (m: CambiosIaMemoria): CambiosIaMemoriaApi => {
    const cambios: CambiosIaMemoriaApi = {};
    if (m.titulo !== undefined) cambios.titulo = m.titulo;
    if (m.contenido !== undefined) cambios.contenido = m.contenido;
    if (m.activo !== undefined) cambios.activo = m.activo;
    return cambios;
};

/**
 * Obtener una memoria por ID
 */
export const getIaMemoria: GetIaMemoria = async (id) => {
    return await RestAPI.getItem<IaMemoria, IaMemoriaApi>(
        `${baseUrl}/${id}`,
        iaMemoriaDesdeApi,
    );
};

/**
 * Obtener lista de memorias con filtros
 */
export const getIaMemorias: GetIaMemorias = async (criteria) => {
    return await RestAPI.getQuery<IaMemoria, IaMemoriaApi>(
        baseUrl,
        criteria,
        iaMemoriaDesdeApi,
    );
};

/**
 * Crear nueva memoria
 */
export const postIaMemoria: PostIaMemoria = async (nuevaIaMemoria) => {
    const respuesta = await RestAPI.post<NuevaIaMemoriaApi>(
        baseUrl,
        nuevaIaMemoriaAApi(nuevaIaMemoria),
        "Error al crear la memoria del asistente",
    );
    return respuesta.id;
};

/**
 * Actualizar memoria existente
 */
export const patchIaMemoria: PatchIaMemoria = async (id, cambios) => {
    await RestAPI.patch<CambiosIaMemoriaApi>(
        `${baseUrl}/${id}`,
        cambiosIaMemoriaAApi(cambios),
        "Error al guardar la memoria del asistente",
    );
};

/**
 * Eliminar memoria
 */
export const deleteIaMemoria: DeleteIaMemoria = async (id) => {
    await RestAPI.delete(
        `${baseUrl}/${id}`,
        "Error al eliminar la memoria del asistente",
    );
};

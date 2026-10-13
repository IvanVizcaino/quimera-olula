import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    CambiosComposicion,
    Composicion,
    DeleteComposicion,
    GetComposicion,
    GetComposiciones,
    LineaComposicion,
    NuevaComposicion,
    PatchComposicion,
    PostComposicion,
} from "./diseño.ts";

const BASE_URL = "/almacen/composicion";

interface LineaComposicionApi {
    id: number | string | null;
    articulo_id: string;
    descripcion?: string | null;
    cantidad: number;
    almacen_id: string;
}

interface ComposicionApi {
    id: number | string;
    fecha: string;
    hora: string;
    almacen_id: string;
    articulo_id: string;
    descripcion?: string | null;
    cantidad: number;
    usuario_id: string;
    lineas?: LineaComposicionApi[];
}

const lineaDesdeApi = (api: LineaComposicionApi): LineaComposicion => ({
    id: api.id == null ? "" : String(api.id),
    articuloId: api.articulo_id,
    descripcion: api.descripcion ?? undefined,
    cantidad: api.cantidad,
    almacenId: api.almacen_id,
});

const composicionDesdeApi = (api: ComposicionApi): Composicion => ({
    id: String(api.id),
    // El API devuelve ISO 8601: la fecha puede llevar parte horaria.
    fecha: api.fecha.slice(0, 10),
    hora: api.hora.includes("T") ? api.hora.slice(11, 16) : api.hora.slice(0, 5),
    almacenId: api.almacen_id,
    articuloId: api.articulo_id,
    descripcion: api.descripcion ?? "",
    cantidad: api.cantidad,
    usuarioId: api.usuario_id,
    lineas: (api.lineas ?? []).map(lineaDesdeApi),
});

const lineaAApi = (l: LineaComposicion): Record<string, unknown> => ({
    ...(l.id ? { id: Number(l.id) } : {}),
    articulo_id: l.articuloId,
    cantidad: l.cantidad,
    almacen_id: l.almacenId,
});

const cambiosAApi = (cambios: CambiosComposicion): Record<string, unknown> => {
    const api: Record<string, unknown> = {};
    if (cambios.almacenId !== undefined) api.almacen_id = cambios.almacenId;
    if (cambios.cantidad !== undefined) api.cantidad = cambios.cantidad;
    if (cambios.fecha !== undefined) api.fecha = cambios.fecha;
    if (cambios.hora !== undefined) api.hora = cambios.hora;
    if (cambios.lineas !== undefined) api.lineas = cambios.lineas.map(lineaAApi);
    if (cambios.regenerarLineas) api.regenerar_lineas = true;
    return api;
};

export const getComposicion: GetComposicion = async (id) =>
    RestAPI.getItem<Composicion, ComposicionApi>(
        `${BASE_URL}/${id}`,
        composicionDesdeApi,
        "Error al cargar la composición",
    );

export const getComposiciones: GetComposiciones = async (criteria) =>
    RestAPI.getQuery<Composicion, ComposicionApi>(
        BASE_URL,
        criteria,
        composicionDesdeApi,
        "Error al cargar composiciones",
    );

export const postComposicion: PostComposicion = async (nueva: NuevaComposicion) => {
    // Sin `lineas` el backend las genera desde `articuloscomp` («Generar composición»).
    const respuesta = await RestAPI.post(
        BASE_URL,
        {
            almacen_id: nueva.almacenId,
            articulo_id: nueva.articuloId,
            cantidad: nueva.cantidad,
            fecha: nueva.fecha,
            hora: nueva.hora,
        },
        "Error al crear la composición",
    );
    return String(respuesta.id);
};

export const patchComposicion: PatchComposicion = async (id, cambios) => {
    await RestAPI.patch(`${BASE_URL}/${id}`, cambiosAApi(cambios), "Error al guardar la composición");
};

export const deleteComposicion: DeleteComposicion = async (id) => {
    await RestAPI.delete(`${BASE_URL}/${id}`, "Error al borrar la composición");
};

/** Exportados para tests de mapeo API ↔ dominio. */
export const composicionDesdeApiParaTest = composicionDesdeApi;
export const cambiosAApiParaTest = cambiosAApi;

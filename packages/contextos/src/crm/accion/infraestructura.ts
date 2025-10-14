import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Filtro, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import ApiUrls from "../comun/urls.ts";
import { Accion } from "./diseño.ts";

export const getAccion = async (id: string): Promise<Accion> =>
    await RestAPI.get<{ datos: Accion }>(`${new ApiUrls().ACCION}/${id}`).then((respuesta) => respuesta.datos);

export const getAcciones = async (
    filtro: Filtro,
    orden: Orden,
    paginacion: Paginacion
): RespuestaLista<Accion> => {
    const q = criteriaQuery(filtro, orden, paginacion);
    return await RestAPI.get<{ datos: Accion[]; total: number }>(new ApiUrls().ACCION + q);
};

export const postAccion = async (accion: Partial<Accion>): Promise<string> => {
    return await RestAPI.post(new ApiUrls().ACCION, accion, "Error al guardar acción").then((respuesta) => respuesta.id);
};

export const patchAccion = async (id: string, accion: Partial<Accion>): Promise<void> => {
    const accionSinNulls = Object.fromEntries(
        Object.entries(accion).map(([k, v]) => [k, v === null ? "" : v])
    );
    await RestAPI.patch(`${new ApiUrls().ACCION}/${id}`, accionSinNulls, "Error al guardar acción");
};

export const deleteAccion = async (id: string): Promise<void> =>
    await RestAPI.delete(`${new ApiUrls().ACCION}/${id}`, "Error al borrar acción");

export const finalizarAccion = async (id: string): Promise<void> => {
    await RestAPI.patch(`${new ApiUrls().ACCION}/${id}/finalizar`, {}, "Error al finalizar acción");
};
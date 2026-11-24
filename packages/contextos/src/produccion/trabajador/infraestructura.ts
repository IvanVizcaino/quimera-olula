import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import { comoBooleano } from "../comun/dominio.ts";
import {
    CambiosTrabajador,
    DeleteSeccionTrabajador,
    DeleteTrabajador,
    GetTrabajador,
    GetTrabajadores,
    NuevoTrabajador,
    PatchSeccionPrincipal,
    PatchTrabajador,
    PostSeccionTrabajador,
    PostTrabajador,
    SeccionTrabajador,
    Trabajador,
} from "./diseño.ts";

const baseUrl = `/produccion/trabajador`;

interface SeccionTrabajadorApi {
    seccion_id: string;
    descripcion?: string | null;
    principal: boolean;
}

export interface TrabajadorApi {
    id: string;
    nombre: string | null;
    seccion_id: string | null;
    seccion: string | null;
    de_baja: boolean | null;
    secciones?: SeccionTrabajadorApi[];
}

type CambiosTrabajadorApi = { nombre?: string; seccion_id?: string | null; de_baja?: boolean };

const seccionTrabajadorDesdeApi = (api: SeccionTrabajadorApi): SeccionTrabajador => ({
    seccionId: api.seccion_id,
    descripcion: api.descripcion ?? "",
    principal: !!api.principal,
});

export const trabajadorDesdeApi = (api: TrabajadorApi): Trabajador => ({
    id: api.id,
    nombre: api.nombre ?? "",
    seccionId: api.seccion_id ?? "",
    seccion: api.seccion ?? "",
    deBaja: !!api.de_baja,
    secciones: (api.secciones ?? []).map(seccionTrabajadorDesdeApi),
});

export const cambiosTrabajadorAApi = (c: CambiosTrabajador): CambiosTrabajadorApi => {
    const cambios: CambiosTrabajadorApi = {};
    if (c.nombre !== undefined) cambios.nombre = c.nombre ?? "";
    if (c.seccionId !== undefined) cambios.seccion_id = c.seccionId || null;
    if (c.deBaja !== undefined) cambios.de_baja = comoBooleano(c.deBaja);
    return cambios;
};

const url = (id: string) => `${baseUrl}/${encodeURIComponent(id)}`;

export const getTrabajador: GetTrabajador = async (id) =>
    RestAPI.getItem<Trabajador, TrabajadorApi>(url(id), trabajadorDesdeApi);

export const getTrabajadores: GetTrabajadores = async (criteria: Criteria) =>
    RestAPI.getQuery<Trabajador, TrabajadorApi>(baseUrl, criteria, trabajadorDesdeApi);

export const postTrabajador: PostTrabajador = async (nuevo: NuevoTrabajador) => {
    const respuesta = await RestAPI.post(
        baseUrl,
        { id: nuevo.id.trim(), nombre: nuevo.nombre, seccion_id: nuevo.seccionId || null },
        "Error al crear el trabajador");
    return respuesta.id;
};

/** Solo se manda lo que cambia el formulario (nombre, sección principal y baja). */
export const patchTrabajador: PatchTrabajador = async (id, cambios) => {
    await RestAPI.patch(url(id), cambiosTrabajadorAApi(cambios), "Error al guardar el trabajador");
};

export const deleteTrabajador: DeleteTrabajador = async (id) => {
    await RestAPI.delete(url(id), "Error al borrar el trabajador");
};

export const postSeccionTrabajador: PostSeccionTrabajador = async (id, seccionId, principal = false) => {
    await RestAPI.post(`${url(id)}/seccion`, { seccion_id: seccionId, principal }, "Error al añadir la sección");
};

export const deleteSeccionTrabajador: DeleteSeccionTrabajador = async (id, seccionId) => {
    await RestAPI.delete(`${url(id)}/seccion/${encodeURIComponent(seccionId)}`, "Error al quitar la sección");
};

export const patchSeccionPrincipal: PatchSeccionPrincipal = async (id, seccionId) => {
    await RestAPI.patch(
        `${url(id)}/seccion/${encodeURIComponent(seccionId)}/principal`, {}, "Error al marcar la sección principal");
};

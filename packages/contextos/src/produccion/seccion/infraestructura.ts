import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import {
    CambiosSeccion,
    DeleteSeccion,
    GetSeccion,
    GetSecciones,
    NuevaSeccion,
    PatchSeccion,
    PostSeccion,
    Seccion,
} from "./diseño.ts";

const baseUrl = `/produccion/seccion`;

interface SeccionApi {
    id: string;
    descripcion: string | null;
}

export const seccionDesdeApi = (api: SeccionApi): Seccion => ({
    id: api.id,
    descripcion: api.descripcion ?? "",
});

export const getSeccion: GetSeccion = async (id) =>
    RestAPI.getItem<Seccion, SeccionApi>(`${baseUrl}/${encodeURIComponent(id)}`, seccionDesdeApi);

export const getSecciones: GetSecciones = async (criteria: Criteria) =>
    RestAPI.getQuery<Seccion, SeccionApi>(baseUrl, criteria, seccionDesdeApi);

export const postSeccion: PostSeccion = async (nueva: NuevaSeccion) => {
    const respuesta = await RestAPI.post(
        baseUrl, { id: nueva.id.trim(), descripcion: nueva.descripcion }, "Error al crear la sección");
    return respuesta.id;
};

export const patchSeccion: PatchSeccion = async (id, cambios: CambiosSeccion) => {
    await RestAPI.patch(
        `${baseUrl}/${encodeURIComponent(id)}`, { descripcion: cambios.descripcion ?? "" },
        "Error al guardar la sección");
};

export const deleteSeccion: DeleteSeccion = async (id) => {
    await RestAPI.delete(`${baseUrl}/${encodeURIComponent(id)}`, "Error al borrar la sección");
};

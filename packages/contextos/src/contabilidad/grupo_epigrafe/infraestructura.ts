import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "#/contabilidad/comun/urls.ts";
import {
    CambiosGrupoEpigrafe,
    DeleteGrupoEpigrafe,
    GetGrupoEpigrafe,
    GetGruposEpigrafes,
    GrupoEpigrafe,
    NuevoGrupoEpigrafe,
    PatchGrupoEpigrafe,
    PostGrupoEpigrafe,
} from "./diseño.ts";

const baseUrl = new ApiUrls().GRUPO_EPIGRAFE;

export interface GrupoEpigrafeApi {
    id: number;
    codigo: string;
    descripcion: string;
    ejercicio_id: string;
}

export const grupoEpigrafeDesdeApi = (
    api: GrupoEpigrafeApi
): GrupoEpigrafe => ({
    id: String(api.id),
    codigo: api.codigo,
    descripcion: api.descripcion ?? "",
    ejercicioId: api.ejercicio_id,
});

export const getGruposEpigrafes: GetGruposEpigrafes = async (criteria) =>
    RestAPI.getQuery<GrupoEpigrafe, GrupoEpigrafeApi>(
        baseUrl,
        criteria,
        grupoEpigrafeDesdeApi
    );

export const getGrupoEpigrafe: GetGrupoEpigrafe = async (id) =>
    RestAPI.getItem<GrupoEpigrafe, GrupoEpigrafeApi>(
        `${baseUrl}/${id}`,
        grupoEpigrafeDesdeApi
    );

export const nuevoGrupoEpigrafeAApi = (nuevo: NuevoGrupoEpigrafe) => ({
    codigo: nuevo.codigo,
    ejercicio_id: nuevo.ejercicioId,
    ...(nuevo.descripcion ? { descripcion: nuevo.descripcion } : {}),
});

export const postGrupoEpigrafe: PostGrupoEpigrafe = async (nuevo) => {
    const respuesta = await RestAPI.post(
        baseUrl,
        nuevoGrupoEpigrafeAApi(nuevo),
        "Error al crear el grupo",
    );
    return String(respuesta.id);
};

export const cambiosGrupoEpigrafeAApi = (cambios: CambiosGrupoEpigrafe) => {
    const api: Record<string, string | null> = {};
    if (cambios.codigo !== undefined) api.codigo = cambios.codigo;
    if (cambios.descripcion !== undefined) {
        api.descripcion = cambios.descripcion || null;
    }
    return api;
};

export const patchGrupoEpigrafe: PatchGrupoEpigrafe = async (id, cambios) => {
    await RestAPI.patch(
        `${baseUrl}/${id}`,
        cambiosGrupoEpigrafeAApi(cambios),
        "Error al guardar el grupo",
    );
};

export const deleteGrupoEpigrafe: DeleteGrupoEpigrafe = async (id) => {
    await RestAPI.delete(`${baseUrl}/${id}`, "Error al borrar el grupo");
};

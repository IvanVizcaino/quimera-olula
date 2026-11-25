import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import {
    CambiosTipoCentroCoste,
    DeleteTipoCentroCoste,
    GetTipoCentroCoste,
    GetTiposCentroCoste,
    NuevoTipoCentroCoste,
    PatchTipoCentroCoste,
    PostTipoCentroCoste,
    TipoCentroCoste,
} from "./diseño.ts";

const baseUrl = `/produccion/tipo_centro_coste`;

interface TipoCentroCosteApi {
    id: string;
    descripcion: string | null;
}

export const tipoCentroCosteDesdeApi = (api: TipoCentroCosteApi): TipoCentroCoste => ({
    id: api.id,
    descripcion: api.descripcion ?? "",
});

export const getTipoCentroCoste: GetTipoCentroCoste = async (id) =>
    RestAPI.getItem<TipoCentroCoste, TipoCentroCosteApi>(`${baseUrl}/${encodeURIComponent(id)}`, tipoCentroCosteDesdeApi);

export const getTiposCentroCoste: GetTiposCentroCoste = async (criteria: Criteria) =>
    RestAPI.getQuery<TipoCentroCoste, TipoCentroCosteApi>(baseUrl, criteria, tipoCentroCosteDesdeApi);

export const postTipoCentroCoste: PostTipoCentroCoste = async (nuevo: NuevoTipoCentroCoste) => {
    const respuesta = await RestAPI.post(
        baseUrl, { id: nuevo.id.trim(), descripcion: nuevo.descripcion }, "Error al crear el tipo de centro de coste");
    return respuesta.id;
};

export const patchTipoCentroCoste: PatchTipoCentroCoste = async (id, cambios: CambiosTipoCentroCoste) => {
    await RestAPI.patch(
        `${baseUrl}/${encodeURIComponent(id)}`, { descripcion: cambios.descripcion ?? "" },
        "Error al guardar el tipo de centro de coste");
};

export const deleteTipoCentroCoste: DeleteTipoCentroCoste = async (id) => {
    await RestAPI.delete(`${baseUrl}/${encodeURIComponent(id)}`, "Error al borrar el tipo de centro de coste");
};

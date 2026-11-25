import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import {
    CambiosCentroCoste,
    CentroCoste,
    DeleteCentroCoste,
    GetCentroCoste,
    GetCentrosCoste,
    NuevoCentroCoste,
    PatchCentroCoste,
    PostCentroCoste,
} from "./diseño.ts";

const baseUrl = `/produccion/centro_coste`;

export interface CentroCosteApi {
    id: string;
    descripcion: string | null;
    tipo_centro_id: string | null;
    tipo_centro: string | null;
}

type CambiosCentroCosteApi = Partial<Pick<CentroCosteApi, "descripcion" | "tipo_centro_id">>;

export const centroCosteDesdeApi = (api: CentroCosteApi): CentroCoste => ({
    id: api.id,
    descripcion: api.descripcion ?? "",
    tipoCentroId: api.tipo_centro_id ?? "",
    tipoCentro: api.tipo_centro ?? "",
});

export const cambiosCentroCosteAApi = (c: CambiosCentroCoste): CambiosCentroCosteApi => {
    const cambios: CambiosCentroCosteApi = {};
    if (c.descripcion !== undefined) cambios.descripcion = c.descripcion ?? "";
    if (c.tipoCentroId !== undefined) cambios.tipo_centro_id = c.tipoCentroId ?? "";
    return cambios;
};

export const getCentroCoste: GetCentroCoste = async (id) =>
    RestAPI.getItem<CentroCoste, CentroCosteApi>(`${baseUrl}/${encodeURIComponent(id)}`, centroCosteDesdeApi);

export const getCentrosCoste: GetCentrosCoste = async (criteria: Criteria) =>
    RestAPI.getQuery<CentroCoste, CentroCosteApi>(baseUrl, criteria, centroCosteDesdeApi);

export const postCentroCoste: PostCentroCoste = async (nuevo: NuevoCentroCoste) => {
    const respuesta = await RestAPI.post(
        baseUrl,
        { id: nuevo.id.trim(), descripcion: nuevo.descripcion, tipo_centro_id: nuevo.tipoCentroId },
        "Error al crear el centro de coste");
    return respuesta.id;
};

export const patchCentroCoste: PatchCentroCoste = async (id, cambios) => {
    await RestAPI.patch(
        `${baseUrl}/${encodeURIComponent(id)}`, cambiosCentroCosteAApi(cambios), "Error al guardar el centro de coste");
};

export const deleteCentroCoste: DeleteCentroCoste = async (id) => {
    await RestAPI.delete(`${baseUrl}/${encodeURIComponent(id)}`, "Error al borrar el centro de coste");
};

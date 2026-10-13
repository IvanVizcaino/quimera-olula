import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    DeleteSubfamilia,
    GetSubfamilia,
    GetSubfamilias,
    NuevaSubfamilia,
    PatchSubfamilia,
    PostSubfamilia,
    Subfamilia,
} from "./diseño.ts";

const BASE_URL = "/almacen/subfamilia";

interface SubfamiliaApi {
    id: string;
    descripcion: string;
    familia_id: string;
    descripcion_familia: string | null;
}

const subfamiliaDesdeApi = (api: SubfamiliaApi): Subfamilia => ({
    id: api.id,
    descripcion: api.descripcion,
    familiaId: api.familia_id,
    descripcionFamilia: api.descripcion_familia,
});

export const getSubfamilia: GetSubfamilia = async (id) =>
    RestAPI.getItem<Subfamilia, SubfamiliaApi>(`${BASE_URL}/${id}`, subfamiliaDesdeApi);

export const getSubfamilias: GetSubfamilias = async (criteria) =>
    RestAPI.getQuery<Subfamilia, SubfamiliaApi>(BASE_URL, criteria, subfamiliaDesdeApi);

export const postSubfamilia: PostSubfamilia = async (nueva: NuevaSubfamilia) => {
    const respuesta = await RestAPI.post(
        BASE_URL,
        { id: nueva.id, descripcion: nueva.descripcion, familia_id: nueva.familiaId },
        "Error al crear subfamilia",
    );
    return respuesta.id;
};

export const patchSubfamilia: PatchSubfamilia = async (id, cambios) => {
    await RestAPI.patch(
        `${BASE_URL}/${id}`,
        { descripcion: cambios.descripcion },
        "Error al actualizar subfamilia",
    );
};

export const deleteSubfamilia: DeleteSubfamilia = async (id) => {
    await RestAPI.delete(`${BASE_URL}/${id}`, "Error al borrar subfamilia");
};

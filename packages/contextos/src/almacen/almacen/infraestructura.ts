import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Filtro, Orden } from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import {
    Almacen,
    AlmacenAPI,
    DeleteAlmacen,
    GetAlmacen,
    GetAlmacenes,
    PatchAlmacen,
    PostAlmacen
} from "./diseño.ts";

const baseUrlAlmacen = `/almacen/almacen`;

// const almacenDesdeApi = (t: AlmacenAPI): Almacen => t;

export const almacenFromApi = (almacenApi: AlmacenAPI): Almacen => ({
    ...almacenApi,
});

export const almacenToApi = (almacen: Almacen): AlmacenAPI => ({
    ...almacen,
});

export const obtenerAlmacenes = async (filtro: Filtro, orden: Orden): Promise<Almacen[]> => {
    const q = criteriaQuery(filtro, orden);

    return RestAPI.get<{ datos: AlmacenAPI[] }>(baseUrlAlmacen + q).then((respuesta) => respuesta.datos.map(almacenFromApi));
}

export const getAlmacen: GetAlmacen = async (id) =>
    await RestAPI.get<{ datos: AlmacenAPI }>(`${baseUrlAlmacen}/${id}`).then((respuesta) =>
        almacenFromApi(respuesta.datos)
    );

export const getAlmacenes: GetAlmacenes = async (
    filtro,
    orden,
    paginacion?
) => {
    const q = criteriaQuery(filtro, orden, paginacion);
    const respuesta = await RestAPI.get<{ datos: AlmacenAPI[]; total: number }>(baseUrlAlmacen + q);
    return { datos: respuesta.datos.map(almacenFromApi), total: respuesta.total };
};

export const postAlmacen: PostAlmacen = async (almacen) => {
    return await RestAPI.post(baseUrlAlmacen, almacen, "Error al guardar Almacen").then(
        (respuesta) => respuesta.id
    );
};

export const patchAlmacen: PatchAlmacen = async (id, almacen) => {
    const apiAlmacen = almacenToApi(almacen as Almacen);
    const almacenSinNulls = Object.fromEntries(
        Object.entries(apiAlmacen).map(([k, v]) => [k, v === null ? "" : v])
    );
    await RestAPI.patch(`${baseUrlAlmacen}/${id}`, almacenSinNulls, "Error al guardar Almacen");
};

export const deleteAlmacen: DeleteAlmacen = async (id) => {
    await RestAPI.delete(`${baseUrlAlmacen}/${id}`, "Error al borrar Almacen");
};

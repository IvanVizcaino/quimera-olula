import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    DeleteUnidadMedida,
    GetUnidadMedida,
    GetUnidadesMedida,
    NuevaUnidadMedida,
    PatchUnidadMedida,
    PostUnidadMedida,
    UnidadMedida,
} from "./diseño.ts";

const BASE_URL = "/almacen/pesosmedidas";

interface UnidadMedidaApi {
    id: string;
    descripcion: string;
    magnitud: string;
    factor_conv: number;
}

const unidadMedidaDesdeApi = (api: UnidadMedidaApi): UnidadMedida => ({
    id: api.id,
    descripcion: api.descripcion,
    magnitud: api.magnitud,
    factorConv: api.factor_conv,
});

const unidadMedidaAApi = (cambios: Partial<UnidadMedida>): Record<string, unknown> => {
    const api: Record<string, unknown> = {};
    if (cambios.descripcion !== undefined) api.descripcion = cambios.descripcion;
    if (cambios.magnitud !== undefined) api.magnitud = cambios.magnitud;
    if (cambios.factorConv !== undefined) api.factor_conv = cambios.factorConv;
    return api;
};

export const getUnidadMedida: GetUnidadMedida = async (id) =>
    RestAPI.getItem<UnidadMedida, UnidadMedidaApi>(`${BASE_URL}/${id}`, unidadMedidaDesdeApi);

export const getUnidadesMedida: GetUnidadesMedida = async (criteria) =>
    RestAPI.getQuery<UnidadMedida, UnidadMedidaApi>(BASE_URL, criteria, unidadMedidaDesdeApi);

export const postUnidadMedida: PostUnidadMedida = async (nueva: NuevaUnidadMedida) => {
    const respuesta = await RestAPI.post(
        BASE_URL,
        {
            id: nueva.id,
            descripcion: nueva.descripcion,
            magnitud: nueva.magnitud,
            factor_conv: nueva.factorConv,
        },
        "Error al crear unidad de medida",
    );
    return respuesta.id;
};

export const patchUnidadMedida: PatchUnidadMedida = async (id, cambios) => {
    await RestAPI.patch(`${BASE_URL}/${id}`, unidadMedidaAApi(cambios), "Error al actualizar unidad de medida");
};

export const deleteUnidadMedida: DeleteUnidadMedida = async (id) => {
    await RestAPI.delete(`${BASE_URL}/${id}`, "Error al borrar unidad de medida");
};

/** Exportado para tests de mapeo API ↔ dominio. */
export const unidadMedidaDesdeApiParaTest = unidadMedidaDesdeApi;
export const unidadMedidaAApiParaTest = unidadMedidaAApi;

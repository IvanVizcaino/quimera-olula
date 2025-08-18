import { RestAPI } from "../../comun/api/rest_api.ts";
import { Filtro, Orden, Paginacion, RespuestaLista } from "../../comun/diseño.ts";
import { criteriaQuery } from "../../comun/infraestructura.ts";
import { EstadoOportunidad } from "./diseño.ts";

const baseUrlEstadoOportunidadVenta = `/crm/estado_oportunidad_venta`;

// Convierte EstadoOportunidad a formato API (valor_defecto -> valordefecto)
export const estadoOportunidadToAPI = (e: EstadoOportunidad) => ({
    ...e,
    valordefecto: e.valor_defecto,
});

export const getEstadoOportunidad = async (id: string): Promise<EstadoOportunidad> =>
    await RestAPI.get<{ datos: EstadoOportunidad }>(`${baseUrlEstadoOportunidadVenta}/${id}`).then((respuesta) => respuesta.datos);


export const getEstadosOportunidad = async (
    filtro: Filtro,
    orden: Orden,
    paginacion?: Paginacion
): RespuestaLista<EstadoOportunidad> => {
    const q = criteriaQuery(filtro, orden, paginacion);

    const respuesta = await RestAPI.get<{ datos: EstadoOportunidad[]; total: number }>(baseUrlEstadoOportunidadVenta + q);
    return { datos: respuesta.datos, total: respuesta.total };
};

export const postEstadoOportunidad = async (estado: EstadoOportunidad): Promise<string> => {
    const payload = estadoOportunidadToAPI(estado);
    return await RestAPI.post(baseUrlEstadoOportunidadVenta, payload, "Error al guardar oportunidad de venta").then((respuesta) => respuesta.id);
};

export const patchEstadoOportunidad = async (id: string, estado: Partial<EstadoOportunidad>): Promise<void> => {
    const payload = estadoOportunidadToAPI(estado as EstadoOportunidad);
    await RestAPI.patch(`${baseUrlEstadoOportunidadVenta}/${id}`, payload, "Error al guardar oportunidad de venta");
};

export const deleteEstadoOportunidad = async (id: string): Promise<void> =>
    await RestAPI.delete(`${baseUrlEstadoOportunidadVenta}/${id}`, "Error al borrar oportunidad de venta");
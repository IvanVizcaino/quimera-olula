import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Entidad, Filtro, Orden } from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import {
    DeleteUbicacion,
    GetStocksUbicacion,
    GetUbicacion,
    GetUbicaciones,
    PatchUbicacion,
    PostUbicacion,
    StockUbicacion,
    StockUbicacionAPI,
    Ubicacion,
} from "./diseño.ts";

const baseUrlUbicacion = `/almacen/ubicacion`;

export interface UbicacionAPI extends Entidad {
    id: string;
    codigo: string;
    zona_id: string;
    zona: string;
}

export interface CambiosUbicacionAPI extends Entidad {
    id: string;
    codigo: string;
    zona_id: string;
}

export const ubicacionFromApi = (ubicacionApi: UbicacionAPI): Ubicacion => ({
    id: ubicacionApi.id,
    codigo: ubicacionApi.codigo,
    idZona: ubicacionApi.zona_id,
    zona: ubicacionApi.zona,
});

export const ubicacionToApi = (ubicacion: Ubicacion): CambiosUbicacionAPI => ({
    id: ubicacion.id,
    codigo: ubicacion.codigo,
    zona_id: ubicacion.idZona,
    zona: ubicacion.zona,
});

export const obtenerUbicaciones = async (filtro: Filtro, orden: Orden): Promise<Ubicacion[]> => {
    const q = criteriaQuery(filtro, orden);

    return RestAPI.get<{ datos: UbicacionAPI[] }>(baseUrlUbicacion + q).then((respuesta) => respuesta.datos.map(ubicacionFromApi));
}

export const getUbicacion: GetUbicacion = async (id) =>
    await RestAPI.get<{ datos: UbicacionAPI }>(`${baseUrlUbicacion}/${id}`).then((respuesta) =>
        ubicacionFromApi(respuesta.datos)
    );

export const getUbicaciones: GetUbicaciones = async (
    filtro,
    orden,
    paginacion?
) => {
    const q = criteriaQuery(filtro, orden, paginacion);
    const respuesta = await RestAPI.get<{ datos: UbicacionAPI[]; total: number }>(baseUrlUbicacion + q);
    return { datos: respuesta.datos.map(ubicacionFromApi), total: respuesta.total };
};

export const postUbicacion: PostUbicacion = async (ubicacion) => {
    const apiUbicacion = {
        codigo: ubicacion.codigo,
        zona_id: ubicacion.zonaId,
    };
    return await RestAPI.post(baseUrlUbicacion, apiUbicacion, "Error al guardar Ubicación").then(
        (respuesta) => respuesta.id
    );
};

export const patchUbicacion: PatchUbicacion = async (id, ubicacion) => {
    const apiUbicacion = ubicacionToApi(ubicacion as Ubicacion);
    const ubicacionSinNulls = Object.fromEntries(
        Object.entries(apiUbicacion).map(([k, v]) => [k, v === null ? "" : v])
    );
    await RestAPI.patch(`${baseUrlUbicacion}/${id}`, ubicacionSinNulls, "Error al guardar Ubicación");
};

export const deleteUbicacion: DeleteUbicacion = async (id) => {
    await RestAPI.delete(`${baseUrlUbicacion}/${id}`, "Error al borrar Ubicación");
};

const baseUrlStockUbicacion = `/almacen/stock_ubicacion`;

export const stockUbicacionFromApi = (api: StockUbicacionAPI): StockUbicacion => ({
    id: api.id,
    stockId: api.stock_id,
    ubicacionId: api.ubicacion_id,
    ubicacion: api.ubicacion,
    articulo: api.articulo,
    articuloId: api.articulo_id,
    cantidadFisica: api.cantidad_fisica,
});

export const getStocksUbicacion: GetStocksUbicacion = async (ubicacionId) => {
    const filtro: Filtro = [["ubicacion_id", "==", ubicacionId]];
    const q = criteriaQuery(filtro, []);
    const respuesta = await RestAPI.get<{ datos: StockUbicacionAPI[] }>(baseUrlStockUbicacion + q);
    return respuesta.datos.map(stockUbicacionFromApi);
};

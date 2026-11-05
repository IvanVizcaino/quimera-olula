import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Entidad, Filtro, Orden } from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import {
    DeleteUbicacion,
    DesgloseCajaStockUbicacion,
    GetDesgloseCajaStockUbicacion,
    GetStocksUbicacion,
    GetStockUbicacion,
    GetUbicacion,
    GetUbicaciones,
    MoviStockUbicacion,
    PatchUbicacion,
    PostUbicacion,
    StockUbicacion,
    StockUbicacionItem,
    Ubicacion,
} from "./diseño.ts";

export interface StockUbicacionItemApi {
    id: string;
    stock_id: string;
    ubicacion_id: string;
    ubicacion: string;
    articulo: string;
    articulo_id: string;
    cantidad_fisica: number;
}

interface MoviStockUbicacionApi extends Entidad {
    id: string;
    cantidad: number;
    fechahora: string;
    lote_id: string;
    lote: string;
    caja_id: string | null;
    caja: string | null;
    concepto: string;
}

interface StockUbicacionApi extends StockUbicacionItemApi {
    movimientos: MoviStockUbicacionApi[]
}


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

export const baseUrlStockUbicacion = `/almacen/stock_ubicacion`;

const stockUbicacionItemFromApi = (api: StockUbicacionItemApi): StockUbicacionItem => ({
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
    const respuesta = await RestAPI.get<{ datos: StockUbicacionItemApi[] }>(baseUrlStockUbicacion + q);
    return respuesta.datos.map(stockUbicacionItemFromApi);
};

const movimientoFromApi = (movimiento: MoviStockUbicacionApi): MoviStockUbicacion => {
    return {
        id: movimiento.id,
        cantidad: movimiento.cantidad,
        fechaHora: new Date(Date.parse(movimiento.fechahora)),
        idLote: movimiento.lote_id,
        lote: movimiento.lote,
        idCaja: movimiento.caja_id,
        caja: movimiento.caja,
        concepto: movimiento.concepto,
    }
}

const stockUbicacionFromApi = (api: StockUbicacionApi): StockUbicacion => ({
    ...stockUbicacionItemFromApi(api),
    movimientos: api.movimientos.map(movimientoFromApi),
});


export const getStockUbicacion: GetStockUbicacion = async (stockUbicacionId) => {
    const respuesta = await RestAPI.get<{ datos: StockUbicacionApi }>(`${baseUrlStockUbicacion}/${stockUbicacionId}`);
    return stockUbicacionFromApi(respuesta.datos);

}

interface DesgloseCajaStockUbicacionApi {
    caja_id: string | null;
    lpn: string | null;
    lote_id: string | null;
    cantidad: number;
}

const desgloseCajaFromApi = (api: DesgloseCajaStockUbicacionApi): DesgloseCajaStockUbicacion => ({
    idCaja: api.caja_id,
    caja: api.lpn,
    idLote: api.lote_id,
    cantidad: api.cantidad,
});

export const getDesgloseCajaStockUbicacion: GetDesgloseCajaStockUbicacion = async (stockUbicacionId) => {
    const respuesta = await RestAPI.get<{ datos: DesgloseCajaStockUbicacionApi[] }>(
        `${baseUrlStockUbicacion}/${stockUbicacionId}/desglose_caja`
    );
    return respuesta.datos.map(desgloseCajaFromApi);
};

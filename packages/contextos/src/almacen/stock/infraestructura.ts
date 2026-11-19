import { baseUrlStockUbicacion, StockUbicacionItemApi } from "#/almacen/ubicacion/infraestructura.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Filtro } from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import { GetStock, GetStocks, StockAPI, StockItem, StockUbicacion } from "./diseño.ts";

const baseUrlStock = `/almacen/stock`;

export const stockItemFromApi = (stockApi: StockAPI): StockItem => ({
    id: stockApi.id,
    articulo: stockApi.articulo,
    almacen: stockApi.almacen,
    articuloId: stockApi.articulo_id,
    almacenId: stockApi.almacen_id,
    cantidadFisica: stockApi.cantidad_fisica,
    cantidadDisponible: stockApi.cantidad_disponible,
    cantidadReservada: stockApi.cantidad_reservada,
    cantidadPendiente: stockApi.cantidad_pendiente,
});

const stockUbicacionFromApi = (api: StockUbicacionItemApi): StockUbicacion => ({
    id: api.id,
    idUbicacion: api.ubicacion_id,
    ubicacion: api.ubicacion,
    cantidad: api.cantidad_fisica,
});

// Las ubicaciones son del SGA: sin él (BD de Eneboo sin SGA) la petición
// puede fallar, y la ficha de stock debe mostrarse igualmente sin ubicaciones.
const getUbicacionesStock = async (id: string): Promise<StockUbicacion[]> => {
    try {
        const respuesta = await RestAPI.get<{ datos: StockUbicacionItemApi[] }>(
            baseUrlStockUbicacion + criteriaQuery([["stock_id", "==", id]] as Filtro, [])
        );
        return respuesta.datos.map(stockUbicacionFromApi);
    } catch {
        return [];
    }
};

export const getStock: GetStock = async (id) => {
    const [stockApi, ubicaciones] = await Promise.all([
        RestAPI.get<{ datos: StockAPI }>(`${baseUrlStock}/${id}`),
        getUbicacionesStock(id),
    ]);
    return {
        ...stockItemFromApi(stockApi.datos),
        ubicaciones,
    };
};

export const getStocks: GetStocks = async (filtro, orden, paginacion?) => {
    const q = criteriaQuery(filtro, orden, paginacion);
    const respuesta = await RestAPI.get<{ datos: StockAPI[]; total: number }>(baseUrlStock + q);
    return { datos: respuesta.datos.map(stockItemFromApi), total: respuesta.total };
};

import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import { GetStock, GetStocks, Stock, StockAPI } from "./diseño.ts";

const baseUrlStock = `/almacen/stock`;

export const stockFromApi = (stockApi: StockAPI): Stock => ({
    id: stockApi.id,
    articulo: stockApi.articulo,
    almacen: stockApi.almacen,
    articuloId: stockApi.articulo_id,
    almacenId: stockApi.almacen_id,
    cantidadFisica: stockApi.cantidad_fisica,
    cantidadDisponible: stockApi.cantidad_disponible,
});

export const getStock: GetStock = async (id) =>
    await RestAPI.get<{ datos: StockAPI }>(`${baseUrlStock}/${id}`).then((respuesta) =>
        stockFromApi(respuesta.datos)
    );

export const getStocks: GetStocks = async (filtro, orden, paginacion?) => {
    const q = criteriaQuery(filtro, orden, paginacion);
    const respuesta = await RestAPI.get<{ datos: StockAPI[]; total: number }>(baseUrlStock + q);
    return { datos: respuesta.datos.map(stockFromApi), total: respuesta.total };
};

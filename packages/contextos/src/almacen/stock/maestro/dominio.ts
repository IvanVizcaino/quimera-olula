import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Stock } from "../diseño.ts";
import { getStocks } from "../infraestructura.ts";
import { ContextoMaestroStock, EstadoMaestroStock } from "./diseño.ts";

type ProcesarMaestroStock = ProcesarContexto<EstadoMaestroStock, ContextoMaestroStock>;

const conStocks = (fn: ProcesarListaActivaEntidades<Stock>) =>
    (ctx: ContextoMaestroStock) => ({ ...ctx, stocks: fn(ctx.stocks) });

export const Stocks = accionesListaActivaEntidades(conStocks);

export const recargarStocks: ProcesarMaestroStock = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getStocks(criteria.filtro, criteria.orden, criteria.paginacion);
    return Stocks.recargar(contexto, resultado);
};

export const ampliarStocks: ProcesarMaestroStock = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getStocks(criteria.filtro, criteria.orden, criteria.paginacion);
    return Stocks.ampliar(contexto, resultado);
};

import { Criteria, ProcesarContexto } from "@olula/lib/diseño.js";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Pedido } from "../diseño.ts";
import { getPedidos } from "../infraestructura.ts";
import { ContextoMaestroPedido, EstadoMaestroPedido } from "./diseño.ts";

type ProcesarPedidos = ProcesarContexto<EstadoMaestroPedido, ContextoMaestroPedido>;

const conPedidos = (fn: ProcesarListaActivaEntidades<Pedido>) => (ctx: ContextoMaestroPedido) => ({ ...ctx, pedidos: fn(ctx.pedidos) });

export const Pedidos = accionesListaActivaEntidades(conPedidos);

export const recargarPedidos: ProcesarPedidos = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getPedidos(criteria.filtro, criteria.orden, criteria.paginacion);

    return Pedidos.recargar(contexto, resultado);
}

export const ampliarPedidos: ProcesarPedidos = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getPedidos(criteria.filtro, criteria.orden, criteria.paginacion);

    return Pedidos.ampliar(contexto, resultado);
}

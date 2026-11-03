import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { ItemPedidoVenta } from "../../diseño.ts";

export type EstadoMaestroPedidoVenta = 'INICIAL' | 'GENERANDO_SALIDA' | 'SALIDA_GENERADA' | 'COMPROBANDO_RESERVAS';

export type ContextoMaestroPedidoVenta = {
    estado: EstadoMaestroPedidoVenta;
    pedidos: ListaActivaEntidades<ItemPedidoVenta>;
    seleccionadas: string[];
    idOrdenCreada: string;
};

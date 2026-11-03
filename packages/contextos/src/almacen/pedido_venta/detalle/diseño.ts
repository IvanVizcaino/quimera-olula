import { PedidoVenta } from "../diseño.ts";

export type EstadoDetallePedidoVenta = "INICIAL" | "ABIERTO";

export type ContextoDetallePedidoVenta = {
    estado: EstadoDetallePedidoVenta;
    pedido: PedidoVenta;
};

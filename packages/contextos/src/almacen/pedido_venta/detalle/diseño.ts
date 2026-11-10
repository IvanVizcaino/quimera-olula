import { EstadoLinea, PedidoVenta } from "../diseño.ts";

export type EstadoDetallePedidoVenta = "INICIAL" | "ABIERTO" | "VIENDO_PEDIDO_COMPETIDOR";

export type PedidoConEstadoLineas = {
    pedido: PedidoVenta;
    estadoLineas: Record<string, EstadoLinea>;
};

export type ContextoDetallePedidoVenta = PedidoConEstadoLineas & {
    estado: EstadoDetallePedidoVenta;
    zonas: number[];
    lineaActiva: string | null;
    pedidoCompetidor: PedidoConEstadoLineas | null;
};

export type CargaDetallePedidoVenta = {
    id?: string;
    zonas: number[];
};

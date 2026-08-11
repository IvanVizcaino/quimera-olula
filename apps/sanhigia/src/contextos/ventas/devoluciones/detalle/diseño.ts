import { DevolucionPedido, LineaDevolucionPedido } from "../diseño.ts";

export type EstadoDetalleDevolucionPedido =
    | "INICIAL"
    | "ABIERTO"
    | "CONFIRMANDO_PREPARAR";

export type ContextoDetalleDevolucionPedido = {
    estado: EstadoDetalleDevolucionPedido;
    devolucion: DevolucionPedido | null;
    lineas: LineaDevolucionPedido[];
    erroresLineas: Record<string, string>;
    error: string;
};

export const contextoDetalleDevolucionPedidoVacio: ContextoDetalleDevolucionPedido = {
    estado: "INICIAL",
    devolucion: null,
    lineas: [],
    erroresLineas: {},
    error: "",
};

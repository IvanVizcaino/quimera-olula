import { ItemPedidoVenta, LineaPedidoVenta, PedidoVenta } from "./diseño.ts";

export const itemPedidoVentaVacio: ItemPedidoVenta = {
    id: "",
    fecha: new Date(0),
    cliente: "",
    codigo: "",
};

export const lineaPedidoVentaVacia: LineaPedidoVenta = {
    id: "",
    referencia: "",
    descripcion: "",
    cantidad: 0,
    pvpUnitario: 0,
    pvpTotal: 0,
    servida: 0,
    cerrada: false,
};

export const pedidoVentaVacio: PedidoVenta = {
    ...itemPedidoVentaVacio,
    observaciones: "",
    lineas: [],
};

import { metaNuevaVenta, nuevaVentaVacia } from "#/ventas/venta/dominio.ts";
import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevoPedido } from "../diseño.ts";

export const metaNuevoPedido: MetaModelo<NuevoPedido> = metaNuevaVenta;
export const nuevoPedidoVacio: NuevoPedido = nuevaVentaVacia;
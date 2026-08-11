import { menuTPV } from "./menu.ts";
import { CrearVentaTpv } from "./venta/crear/CrearVentaTpv.tsx";

export class FactoryTpvOlula {
    // static PedidoTabDatos = PedidoTabDatosBase
    // static pedidoDesdeAPI = pedidoDesdeAPI
    // static metaTablaPedido = metaTablaPedido
    // static api_payloadPatchPedido = payloadPatchPedido
    // static metaPedido = metaPedido
    static venta_CrearVenta = CrearVentaTpv
    static menu = menuTPV
}

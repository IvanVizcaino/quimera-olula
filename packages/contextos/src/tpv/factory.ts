import { menuTPV } from "./menu.ts";
import { CrearVentaTpv } from "./venta/crear/CrearVentaTpv.tsx";

export class FactoryTpvOlula {
    // static PedidoTabDatos = PedidoTabDatosBase
    // static pedidoDesdeAPI = pedidoDesdeAPI
    // static metaTablaPedido = metaTablaPedido
    // static api_payloadPatchPedido = payloadPatchPedido
    // static metaPedido = metaPedido
    static venta_CrearVenta = CrearVentaTpv
    static venta_imprimirValesAntesQueTique = false
    // Enviar el efectivo entregado al cobrar (el servidor lo guarda e imprime con el cambio en el tique)
    static venta_enviarEfectivoEntregado = false
    static menu = menuTPV
}

import { Layout } from "@olula/lib/useLayout.js";
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
    // Mostrar el botón "P. QR" (cobro con QR por Stripe) si la pasarela está activa
    static venta_pagoConQr = true
    // Vista inicial del listado de ventas del TPV ("TARJETA" | "TABLA")
    static venta_layoutInicial: Layout = "TARJETA"
    static menu = menuTPV
}

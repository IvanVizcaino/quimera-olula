import { payloadPatchPedido } from "#/ventas/pedido/infraestructura.ts";
import { Pedido } from "#/ventas/pedido/diseño.ts";
import { menuVentas } from "./menu.ts";
import { CrearLineaNrj } from "./pedido/crear_linea/CrearLinea.tsx";
import { DetallePedidoNrj } from "./pedido/detalle/DetallePedido.tsx";
import { LineasListaNrj } from "./pedido/detalle/lineas/LineasLista.tsx";
import { CambiarLineaNrj } from "./pedido/cambiar_linea/CambiarLinea.tsx";
import { ventasPedidoInfra } from "./pedido/infraestructura.ts";
import { getMetaTablaPedidoNrj } from "./pedido/maestro/metatabla_pedido.tsx";
import { PedidoNrj } from "./pedido/diseño.ts";

const payloadPatchPedidoNrj = (pedido: Pedido) => {
    const base = payloadPatchPedido(pedido);
    const nrj = pedido as PedidoNrj;
    return {
        ...base,
        cambios: {
            ...base.cambios,
            portes_cliente: nrj.portes_cliente,
            transportista_id: nrj.transportista_id,
        },
    };
};

export class FactoryVentasNrj {

    static menu = menuVentas

    static pedido_detalle_lineas_LineasLista = LineasListaNrj
    static pedido_DetallePedido = DetallePedidoNrj
    static pedido_CrearLinea = CrearLineaNrj
    static pedido_CambiarLinea = CambiarLineaNrj
    static pedido_infraestructura = ventasPedidoInfra
    static metaTablaPedido = getMetaTablaPedidoNrj
    static api_payloadPatchPedido = payloadPatchPedidoNrj
}

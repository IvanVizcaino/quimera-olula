import { AlbaranarPedido } from "#/ventas/albaranar_pedido/vistas/detalle/AlbaranarPedido.tsx";
import { DetalleAprobarPresupuesto } from "#/ventas/aprobarPresupuesto/detalle/DetalleAprobarPresupuesto.tsx";
import { MaestroConDetalleCliente } from "#/ventas/cliente/maestro/MaestroConDetalleCliente.tsx";
import { MaestroConDetallePedido } from "#/ventas/pedido/maestro/MaestroConDetallePedido.tsx";
import { MaestroConDetallePresupuesto } from "#/ventas/presupuesto/maestro/MaestroConDetallePresupuesto.tsx";
import { MaestroConDetalleComparativaVentas } from "./comparativa_ventas/maestro/MaestroConDetalleComparativaVentas.tsx";

export class RouterFactoryVentasDtsOabe {
    static router = {
        "ventas/cliente": MaestroConDetalleCliente,
        "ventas/cliente/:id": MaestroConDetalleCliente,
        "ventas/presupuesto": MaestroConDetallePresupuesto,
        "ventas/pedido": MaestroConDetallePedido,
        "ventas/albaranar-pedido/:id": AlbaranarPedido,
        "ventas/aprobar-presupuesto/:id": DetalleAprobarPresupuesto,
        "ventas/comparativa_ventas": MaestroConDetalleComparativaVentas,
    };
}

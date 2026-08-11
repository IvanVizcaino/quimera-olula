import { MaestroConDetalleAlbaran } from "./albaran/maestro/MaestroConDetalleAlbaran.tsx";
import { MaestroConDetalleArticulo } from "./articulo/MaestroConDetalleArticulo.tsx";
import { DetalleAlbaranarPedido } from "./albaranarPedido/detalle/DetalleAlbaranarPedido.tsx";
import { MaestroConDetalleCliente } from "./cliente/maestro/MaestroConDetalleCliente.tsx";
import { MaestroConDetalleFactura } from "./factura/maestro/MaestroConDetalleFactura.tsx";
import { MaestroConDetallePedido } from "./pedido/maestro/MaestroConDetallePedido.tsx";
import { MaestroConDetallePresupuesto } from "./presupuesto/maestro/MaestroConDetallePresupuesto.tsx";

export class RouterFactoryVentasOlula {
    static router = {
        "ventas/cliente": MaestroConDetalleCliente,
        "ventas/presupuesto": MaestroConDetallePresupuesto,
        "ventas/pedido": MaestroConDetallePedido,
        "ventas/albaran": MaestroConDetalleAlbaran,
        "ventas/factura": MaestroConDetalleFactura,
        "ventas/articulo": MaestroConDetalleArticulo,
        "ventas/articulo/:id": MaestroConDetalleArticulo,
        "ventas/albaranar-pedido/:id": DetalleAlbaranarPedido,
        "ventas/pedido/:id": MaestroConDetallePedido,
        "ventas/presupuesto/:id": MaestroConDetallePresupuesto,
        "ventas/albaran/:id": MaestroConDetalleAlbaran,
        "ventas/factura/:id": MaestroConDetalleFactura,
    }
}

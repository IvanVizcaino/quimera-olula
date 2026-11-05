import { MaestroConDetalleAgente } from "./agente/maestro/MaestroConDetalleAgente.tsx";
import { MaestroConDetalleAlbaran } from "./albaran/maestro/MaestroConDetalleAlbaran.tsx";
import { AlbaranarPedido } from "./albaranar_pedido/vistas/detalle/AlbaranarPedido.tsx";
import { DetalleAprobarPresupuesto } from "./aprobarPresupuesto/detalle/DetalleAprobarPresupuesto.tsx";
import { MaestroConDetalleArticulo } from "./articulo/MaestroConDetalleArticulo.tsx";
import { MaestroConDetalleCliente } from "./cliente/maestro/MaestroConDetalleCliente.tsx";
import { MaestroConDetalleFactura } from "./factura/maestro/MaestroConDetalleFactura.tsx";
import { MaestroConDetallePedido } from "./pedido/maestro/MaestroConDetallePedido.tsx";
import { MaestroConDetallePresupuesto } from "./presupuesto/maestro/MaestroConDetallePresupuesto.tsx";
import { MaestroConDetalleTarifa } from "./tarifa/maestro/MaestroConDetalleTarifa.tsx";

export class RouterFactoryVentasOlula {
        static router = {
                "ventas/cliente": MaestroConDetalleCliente,
                "ventas/presupuesto": MaestroConDetallePresupuesto,
                "ventas/pedido": MaestroConDetallePedido,
                "ventas/albaran": MaestroConDetalleAlbaran,
                "ventas/factura": MaestroConDetalleFactura,
                "ventas/articulo": MaestroConDetalleArticulo,
                "ventas/albaranar-pedido/:id": AlbaranarPedido,
                "ventas/aprobar-presupuesto/:id": DetalleAprobarPresupuesto,
                "ventas/tarifa": MaestroConDetalleTarifa,
                "ventas/agente": MaestroConDetalleAgente,
        }
}

import { ConfigCompras } from "./config/vistas/ConfigCompras.tsx";
import { MaestroConDetalleAlbaran } from "./albaran/maestro/MaestroConDetalleAlbaran.tsx";
import { MaestroConDetalleArticulo } from "./articulo/maestro/MaestroConDetalleArticulo.tsx";
import { MaestroConDetalleFactura } from "./factura/maestro/MaestroConDetalleFactura.tsx";
import { MaestroConDetallePedido } from "./pedido/maestro/MaestroConDetallePedido.tsx";
import { MaestroConDetalleProveedor } from "./proveedor/maestro/MaestroConDetalleProveedor.tsx";
import { AlbaranarPedido } from "./albaranar_pedido/vistas/detalle/AlbaranarPedido.tsx";
import { InformesCompras } from "./informe/InformesCompras.tsx";

export class RouterFactoryComprasOlula {
    static router = {
        "compras/config": ConfigCompras,
        "compras/pedido": MaestroConDetallePedido,
        "compras/albaran": MaestroConDetalleAlbaran,
        "compras/factura": MaestroConDetalleFactura,
        "compras/proveedor": MaestroConDetalleProveedor,
        "compras/articulo": MaestroConDetalleArticulo,
        "compras/albaranar-pedido/:id": AlbaranarPedido,
        "compras/informe": InformesCompras,
    };
}

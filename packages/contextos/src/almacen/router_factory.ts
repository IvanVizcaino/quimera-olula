import { MaestroAlmacen } from "./almacen/vistas/maestro/MaestroAlmacen.tsx"
import { MaestroConDetalleArticulo } from "./articulo/maestro/MaestroConDetalleArticulo.tsx"
import { MaestroConDetalleCaja } from "./caja/maestro/MaestroConDetalleCaja.tsx"
import { MaestroFamilia } from "./familia/vistas/maestro/MaestroFamilia.tsx"
import { MaestroOrden } from "./orden/vistas/maestro/MaestroOrden.tsx"
import { MaestroConDetalleStock } from "./stock/maestro/MaestroConDetalleStock.tsx"
import { MaestroDetalleTransferenciasStock } from "./transferencias/vistas/MaestroDetalleTransferenciasStock.tsx"
import { MaestroConDetalleUbicacion } from "./ubicacion/vistas/maestro/MaestroConDetalleUbicacion.tsx"
import { MaestroConDetalleTipoCaja } from "./tipo_caja/vistas/maestro/MaestroConDetalleTipoCaja.tsx"
import { MaestroPedidoVenta } from "./pedido_venta/vistas/maestro/MaestroPedidoVenta.tsx"
import { MaestroConDetallePedidoCompra } from "./pedido_compra/maestro/MaestroConDetallePedidoCompra.tsx"
import { MaestroConDetalleTipoUbicacion } from "./tipo_ubicacion/maestro/MaestroConDetalleTipoUbicacion.tsx"
import { MaestroConDetalleClaseAlmacenamiento } from "./clase_almacenamiento/maestro/MaestroConDetalleClaseAlmacenamiento.tsx"
import { MaestroConDetallePickingFijo } from "./picking_fijo/maestro/MaestroConDetallePickingFijo.tsx"
import { MapaAlmacen } from "./mapa/MapaAlmacen.tsx"
import { ReposicionPicking } from "./reposicion/ReposicionPicking.tsx"
import { Slotting } from "./slotting/Slotting.tsx"
import { MaestroConDetalleZona } from "./zona/vistas/maestro/MaestroConDetalleZona.tsx"
import { MaestroConDetallePesoMedida } from "./peso_medida/maestro/MaestroConDetallePesoMedida.tsx"

export class RouterFactoryAlmacenOlula {
        static router = {
                "almacen/transferencias": MaestroDetalleTransferenciasStock,
                "almacen/articulo": MaestroConDetalleArticulo,
                "almacen/cajas": MaestroConDetalleCaja,
                "almacen/almacenes": MaestroAlmacen,
                "almacen/familias": MaestroFamilia,
                "almacen/pesos_medidas": MaestroConDetallePesoMedida,
                "almacen/ordenes": MaestroOrden,
                "almacen/pedidos_compra": MaestroConDetallePedidoCompra,
                "almacen/pedidos_venta": MaestroPedidoVenta,
                "almacen/stock": MaestroConDetalleStock,
                "almacen/ubicaciones": MaestroConDetalleUbicacion,
                "almacen/tipos_caja": MaestroConDetalleTipoCaja,
                "almacen/tipos_ubicacion": MaestroConDetalleTipoUbicacion,
                "almacen/clases_almacenamiento": MaestroConDetalleClaseAlmacenamiento,
                "almacen/zonas": MaestroConDetalleZona,
                "almacen/picking_fijo": MaestroConDetallePickingFijo,
                "almacen/reposicion": ReposicionPicking,
                "almacen/slotting": Slotting,
                "almacen/mapa": MapaAlmacen,
        }
}

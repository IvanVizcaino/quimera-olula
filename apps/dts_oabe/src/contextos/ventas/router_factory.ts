import { MaestroConDetalleClienteDtsOabe } from "./cliente/MaestroConDetalleClienteDtsOabe.tsx";
import { MaestroConDetalleComparativaVentas } from "./comparativa_ventas/maestro/MaestroConDetalleComparativaVentas.tsx";

export class RouterFactoryVentasDtsOabe {
    static router = {
        "ventas/cliente": MaestroConDetalleClienteDtsOabe,
        "ventas/cliente/:id": MaestroConDetalleClienteDtsOabe,
        "ventas/comparativa_ventas": MaestroConDetalleComparativaVentas,
    };
}

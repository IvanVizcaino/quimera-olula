import { MaestroConDetalleCliente } from "#/ventas/cliente/maestro/MaestroConDetalleCliente.tsx";
import { MaestroConDetalleComparativaVentas } from "./comparativa_ventas/maestro/MaestroConDetalleComparativaVentas.tsx";

export class RouterFactoryVentasDtsOabe {
    static router = {
        "ventas/cliente": MaestroConDetalleCliente,
        "ventas/cliente/:id": MaestroConDetalleCliente,
        "ventas/comparativa_ventas": MaestroConDetalleComparativaVentas,
    };
}

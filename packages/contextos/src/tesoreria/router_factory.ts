import { MaestroConDetalleConciliacion } from "./conciliacion/maestro/MaestroConDetalleConciliacion.tsx";
import { MaestroConDetalleConexionBancaria } from "./conexion_bancaria/maestro/MaestroConDetalleConexionBancaria.tsx";
import { MaestroConDetalleMandato } from "./mandato/maestro/MaestroConDetalleMandato.tsx";
import { MaestroConDetalleReciboCompra } from "./recibo_compra/maestro/MaestroConDetalleReciboCompra.tsx";
import { MaestroConDetalleReciboVenta } from "./recibo_venta/maestro/MaestroConDetalleReciboVenta.tsx";
import { MaestroConDetalleRemesa } from "./remesa/maestro/MaestroConDetalleRemesa.tsx";
import { MaestroConDetalleRemesaPago } from "./remesa_pago/maestro/MaestroConDetalleRemesaPago.tsx";

export class RouterFactoryTesoreriaOlula {
    static router = {
        "tesoreria/remesa": MaestroConDetalleRemesa,
        "tesoreria/remesa_pago": MaestroConDetalleRemesaPago,
        "tesoreria/mandato": MaestroConDetalleMandato,
        "tesoreria/recibo_venta": MaestroConDetalleReciboVenta,
        "tesoreria/recibo_compra": MaestroConDetalleReciboCompra,
        "tesoreria/conexion_bancaria": MaestroConDetalleConexionBancaria,
        "tesoreria/conciliacion": MaestroConDetalleConciliacion,
    };
}

import { MaestroConDetalleAsiento } from "./asiento/vistas/maestro/MaestroConDetalleAsiento.tsx";
import { MaestroConDetalleCuentasAnuales } from "./cuentas_anuales/maestro/MaestroConDetalleCuentasAnuales.tsx";
import { MaestroConDetalleLibroDiario } from "./libro_diario/maestro/MaestroConDetalleLibroDiario.tsx";
import { MaestroConDetalleLibroFacturasEmitidas } from "./libro_facturas_emitidas/maestro/MaestroConDetalleLibroFacturasEmitidas.tsx";
import { MaestroConDetalleLibroFacturasRecibidas } from "./libro_facturas_recibidas/maestro/MaestroConDetalleLibroFacturasRecibidas.tsx";
import { MaestroConDetalleLibroMayor } from "./libro_mayor/maestro/MaestroConDetalleLibroMayor.tsx";
import { PantallaPgc } from "./pgc/Pgc.tsx";

export class RouterFactoryContabilidadOlula {
    static router = {
        "contabilidad/asiento": MaestroConDetalleAsiento,
        "contabilidad/pgc": PantallaPgc,
        "contabilidad/cuentas_anuales": MaestroConDetalleCuentasAnuales,
        "contabilidad/libro_diario": MaestroConDetalleLibroDiario,
        "contabilidad/libro_mayor": MaestroConDetalleLibroMayor,
        "contabilidad/libro_facturas_emitidas": MaestroConDetalleLibroFacturasEmitidas,
        "contabilidad/libro_facturas_recibidas": MaestroConDetalleLibroFacturasRecibidas,
    };
}

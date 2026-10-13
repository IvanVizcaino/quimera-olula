import { MaestroConDetalleAsiento } from "./asiento/vistas/maestro/MaestroConDetalleAsiento.tsx";
import { InformeBalance } from "./informe/vistas/balance/InformeBalance.tsx";
import { InformeDiario } from "./informe/vistas/diario/InformeDiario.tsx";
import { InformeIngresosGastos } from "./informe/vistas/ingresos_gastos/InformeIngresosGastos.tsx";
import { InformeMayor } from "./informe/vistas/mayor/InformeMayor.tsx";
import { InformePatrimonio } from "./informe/vistas/patrimonio/InformePatrimonio.tsx";
import { InformePyg } from "./informe/vistas/pyg/InformePyg.tsx";
import { InformeSumasSaldos } from "./informe/vistas/sumas_saldos/InformeSumasSaldos.tsx";
import { InformeLibroFacturasRecCcaja } from "./informe/vistas/libro_facturas_rec_ccaja/InformeLibroFacturasRecCcaja.tsx";
import { InformeLibroFacturasEmitidas } from "./informe/vistas/libro_facturas_iva/InformeLibroFacturasEmitidas.tsx";
import { InformeLibroFacturasRecibidas } from "./informe/vistas/libro_facturas_iva/InformeLibroFacturasRecibidas.tsx";
import { Modelo303 } from "./modelo_303/vistas/Modelo303.tsx";
import { GenerarModelo340 } from "./modelo_340/vistas/GenerarModelo340.tsx";
import { GenerarModelo349 } from "./modelo_349/vistas/GenerarModelo349.tsx";
import { GenerarModelo347 } from "./modelo_347/vistas/GenerarModelo347.tsx";
import { CierreEjercicio } from "./ejercicio/vistas/CierreEjercicio.tsx";
import { RecalcularSaldosSubcuentas } from "./subcuenta/recalcular_saldos/RecalcularSaldosSubcuentas.tsx";
import { MaestroSubcuenta } from "./subcuenta/maestro/MaestroSubcuenta.tsx";
import { MaestroCuenta } from "./cuenta/maestro/MaestroCuenta.tsx";

export class RouterFactoryContabilidadOlula {
    static router = {
        "contabilidad/asiento": MaestroConDetalleAsiento,
        "contabilidad/subcuenta": MaestroSubcuenta,
        "contabilidad/cuenta": MaestroCuenta,
        "contabilidad/subcuenta/recalcular_saldos": RecalcularSaldosSubcuentas,
        "contabilidad/informe/mayor": InformeMayor,
        "contabilidad/informe/sumas_saldos": InformeSumasSaldos,
        "contabilidad/informe/balance": InformeBalance,
        "contabilidad/informe/libro_facturas_recibidas_ccaja": InformeLibroFacturasRecCcaja,
        "contabilidad/informe/libro_facturas_emitidas": InformeLibroFacturasEmitidas,
        "contabilidad/informe/libro_facturas_recibidas": InformeLibroFacturasRecibidas,
        "contabilidad/informe/pyg": InformePyg,
        "contabilidad/informe/diario": InformeDiario,
        "contabilidad/informe/ingresos_gastos": InformeIngresosGastos,
        "contabilidad/informe/patrimonio": InformePatrimonio,
        "contabilidad/modelo_303": Modelo303,
        "contabilidad/modelo_347": GenerarModelo347,
        "contabilidad/modelo_349": GenerarModelo349,
        "contabilidad/modelo_340": GenerarModelo340,
        "contabilidad/ejercicio/cierre": CierreEjercicio,
    };
}

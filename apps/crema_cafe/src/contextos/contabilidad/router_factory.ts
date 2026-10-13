import { RouterFactoryContabilidadOlula } from "#/contabilidad/router_factory.ts";
import { rutaConPlugin } from "@olula/lib/plugins.tsx";

const r = RouterFactoryContabilidadOlula.router;

export class RouterFactoryContabilidadCremaCafe {
    static router = {
        "contabilidad/asiento": r["contabilidad/asiento"],
        "contabilidad/subcuenta": r["contabilidad/subcuenta"],
        "contabilidad/cuenta": r["contabilidad/cuenta"],
        "contabilidad/subcuenta/recalcular_saldos": r["contabilidad/subcuenta/recalcular_saldos"],
        "contabilidad/informe/mayor": r["contabilidad/informe/mayor"],
        "contabilidad/informe/sumas_saldos": r["contabilidad/informe/sumas_saldos"],
        "contabilidad/informe/balance": r["contabilidad/informe/balance"],
        "contabilidad/informe/libro_facturas_recibidas_ccaja": rutaConPlugin(
            "criterio_caja",
            r["contabilidad/informe/libro_facturas_recibidas_ccaja"]
        ),
        "contabilidad/informe/libro_facturas_emitidas": r["contabilidad/informe/libro_facturas_emitidas"],
        "contabilidad/informe/libro_facturas_recibidas": r["contabilidad/informe/libro_facturas_recibidas"],
        "contabilidad/informe/pyg": r["contabilidad/informe/pyg"],
        "contabilidad/informe/diario": r["contabilidad/informe/diario"],
        "contabilidad/informe/ingresos_gastos": r["contabilidad/informe/ingresos_gastos"],
        "contabilidad/informe/patrimonio": r["contabilidad/informe/patrimonio"],
        "contabilidad/modelo_303": rutaConPlugin("modelo_303", r["contabilidad/modelo_303"]),
        "contabilidad/modelo_347": rutaConPlugin("modelo_347", r["contabilidad/modelo_347"]),
        "contabilidad/modelo_349": rutaConPlugin("modelo_349", r["contabilidad/modelo_349"]),
        "contabilidad/modelo_340": rutaConPlugin("modelo_340", r["contabilidad/modelo_340"]),
        "contabilidad/ejercicio/cierre": r["contabilidad/ejercicio/cierre"],
    };
}

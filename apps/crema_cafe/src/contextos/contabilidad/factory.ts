import { FactoryContabilidadOlula } from "#/contabilidad/factory.ts";
import { menuContabilidad } from "#/contabilidad/menu.ts";

export class FactoryContabilidadCremaCafe extends FactoryContabilidadOlula {
    static override menu = {
        Contabilidad: menuContabilidad.Contabilidad,
        "Contabilidad/Asientos": menuContabilidad["Contabilidad/Asientos"],
        "Contabilidad/Plan de cuentas": menuContabilidad["Contabilidad/Plan de cuentas"],
        "Contabilidad/Cuentas PGC": menuContabilidad["Contabilidad/Cuentas PGC"],
        "Contabilidad/Recalcular saldos": menuContabilidad["Contabilidad/Recalcular saldos"],
        "Contabilidad/Libro mayor": menuContabilidad["Contabilidad/Libro mayor"],
        "Contabilidad/Sumas y saldos": menuContabilidad["Contabilidad/Sumas y saldos"],
        "Contabilidad/Balance": menuContabilidad["Contabilidad/Balance"],
        "Contabilidad/Pérdidas y ganancias": menuContabilidad["Contabilidad/Pérdidas y ganancias"],
        "Contabilidad/Libro diario": menuContabilidad["Contabilidad/Libro diario"],
        "Contabilidad/Ingresos y gastos reconocidos":
            menuContabilidad["Contabilidad/Ingresos y gastos reconocidos"],
        "Contabilidad/Cambios en el patrimonio neto":
            menuContabilidad["Contabilidad/Cambios en el patrimonio neto"],
        "Contabilidad/Cierre de ejercicio": menuContabilidad["Contabilidad/Cierre de ejercicio"],
        "Contabilidad/Modelo 303": {
            url: "/contabilidad/modelo_303",
            regla: "contabilidad.asiento",
            plugin: "modelo_303",
        },
        "Contabilidad/Modelo 347": {
            url: "/contabilidad/modelo_347",
            regla: "contabilidad.asiento",
            plugin: "modelo_347",
        },
        "Contabilidad/Modelo 349": {
            url: "/contabilidad/modelo_349",
            regla: "contabilidad.asiento",
            plugin: "modelo_349",
        },
        "Contabilidad/Modelo 340": {
            url: "/contabilidad/modelo_340",
            regla: "contabilidad.asiento",
            plugin: "modelo_340",
        },
        "Contabilidad/Periodos de IVA": {
            url: "/comun/periodo_iva",
            regla: "comun.grupo_iva_producto",
            plugin: "cambio_iva",
        },
        "Contabilidad/Libro IVA emitidas": {
            url: "/contabilidad/informe/libro_facturas_emitidas",
            regla: "contabilidad.asiento",
        },
        "Contabilidad/Libro IVA recibidas": {
            url: "/contabilidad/informe/libro_facturas_recibidas",
            regla: "contabilidad.asiento",
        },
        "Contabilidad/Libro IVA recibidas (RECC)": {
            url: "/contabilidad/informe/libro_facturas_recibidas_ccaja",
            regla: "contabilidad.asiento",
            plugin: "criterio_caja",
        },
    } as unknown as typeof FactoryContabilidadOlula.menu;
}

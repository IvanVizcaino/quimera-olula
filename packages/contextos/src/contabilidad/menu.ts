export const menuContabilidad = {
    Contabilidad: { icono: "fichero", posicion: 50 },
    "Contabilidad/Asientos": { url: "/contabilidad/asiento", regla: "contabilidad.asiento" },
    "Contabilidad/Plan de cuentas": {
        url: "/contabilidad/subcuenta",
        regla: "contabilidad.asiento",
    },
    "Contabilidad/Cuentas PGC": {
        url: "/contabilidad/cuenta",
        regla: "contabilidad.asiento",
    },
    "Contabilidad/Recalcular saldos": {
        url: "/contabilidad/subcuenta/recalcular_saldos",
        regla: "contabilidad.subcuenta",
    },
    "Contabilidad/Libro mayor": { url: "/contabilidad/informe/mayor", regla: "contabilidad.asiento" },
    "Contabilidad/Sumas y saldos": {
        url: "/contabilidad/informe/sumas_saldos",
        regla: "contabilidad.asiento",
    },
    "Contabilidad/Balance": { url: "/contabilidad/informe/balance", regla: "contabilidad.asiento" },
    "Contabilidad/Pérdidas y ganancias": {
        url: "/contabilidad/informe/pyg",
        regla: "contabilidad.asiento",
    },
    "Contabilidad/Libro diario": { url: "/contabilidad/informe/diario", regla: "contabilidad.asiento" },
    "Contabilidad/Ingresos y gastos reconocidos": {
        url: "/contabilidad/informe/ingresos_gastos",
        regla: "contabilidad.asiento",
    },
    "Contabilidad/Cambios en el patrimonio neto": {
        url: "/contabilidad/informe/patrimonio",
        regla: "contabilidad.asiento",
    },
    "Contabilidad/Cierre de ejercicio": {
        url: "/contabilidad/ejercicio/cierre",
        regla: "contabilidad.asiento",
    },
};

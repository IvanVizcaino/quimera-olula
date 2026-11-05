export const menuTesoreria = {
    "Tesorería": { icono: "menu_tesoreria", area: "Finanzas" },
    "Tesorería/Resumen": { url: "/dashboard/tesoreria" },
    "Tesorería/Remesas de cobro": { alias: ["SEPA", "domiciliaciones"], url: "/tesoreria/remesa", regla: "tesoreria.remesa" },
    "Tesorería/Remesas de pago": { alias: ["transferencias", "nóminas"], url: "/tesoreria/remesa_pago", regla: "tesoreria.remesa_pago", plugin: "remesa_pago" },
    "Tesorería/Mandatos": { url: "/tesoreria/mandato", regla: "tesoreria.mandato" },
    "Tesorería/Recibos de cobro": { url: "/tesoreria/recibo_venta", regla: "tesoreria.recibo_venta" },
    "Tesorería/Recibos de pago": { url: "/tesoreria/recibo_compra", regla: "tesoreria.recibo_compra" },
    "Tesorería/Conexiones bancarias": { url: "/tesoreria/conexion_bancaria", regla: "tesoreria.conexion_bancaria" },
    "Tesorería/Cuentas bancarias": { alias: ["banco", "conciliación", "extracto", "movimientos"], url: "/tesoreria/cuentas_bancarias", regla: "tesoreria.cuentas_bancarias.leer" },
    "Tesorería/Configuración": { alias: ["remesas", "pago diferido", "pago indirecto"], url: "/tesoreria/config", regla: "tesoreria.config" },
};

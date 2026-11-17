export const menuPredicciones = {
    "Predicciones": { icono: "menu_predicciones", area: "Finanzas" },
    // Reglas de las consultas que usa cada pantalla (consultas/predicciones).
    "Predicciones/Ventas": {
        url: "/predicciones/dashboard",
        regla: [
            "predicciones.facturacion_global_mensual", "predicciones.facturacion_global_semanal",
            "predicciones.ventas_ref_pvp_mensual", "predicciones.ventas_ref_pvp_semanal",
        ],
    },
    "Predicciones/Stock": {
        url: "/predicciones/stock",
        regla: ["predicciones.ventas_ref_pvp_mensual", "predicciones.ventas_ref_pvp_semanal"],
    },
    "Predicciones/Métricas": { url: "/predicciones/metricas", regla: "predicciones.metricas_calidad" },
};

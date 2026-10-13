import { recargarVales, Vales } from "./dominio.ts";

export const getMaquinaVales = () => ({
    INICIAL: {
        vale_seleccionado: [Vales.activar],
        seleccion_cancelada: Vales.desactivar,
        vale_cambiado: Vales.cambiar,
        recarga_solicitada: recargarVales,
        criteria_cambiado: [Vales.filtrar, recargarVales],
        anular_solicitado: "ANULANDO",
    },
    ANULANDO: {
        vale_anulado: [Vales.cambiar, "INICIAL"],
        anulacion_cancelada: "INICIAL",
    },
});

import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroPeriodoIva, EstadoMaestroPeriodoIva } from "./diseño.ts";
import { PeriodosIva, cambiarImpuesto, recargarPeriodosIva } from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoMaestroPeriodoIva, ContextoMaestroPeriodoIva> = () => ({
    INICIAL: {
        periodo_cambiado: PeriodosIva.cambiar,
        periodo_seleccionado: [PeriodosIva.activar],
        seleccion_cancelada: PeriodosIva.desactivar,
        periodo_borrado: async (contexto) => {
            if (!contexto.periodos.activo) return contexto;
            return PeriodosIva.quitar(contexto, contexto.periodos.activo);
        },
        periodo_creado: PeriodosIva.incluir,
        recarga_solicitada: recargarPeriodosIva,
        criteria_cambiado: [PeriodosIva.filtrar, recargarPeriodosIva],
        impuesto_cambiado: cambiarImpuesto,
        crear: "CREANDO",
    },
    CREANDO: {
        periodo_creado: [PeriodosIva.incluir, "INICIAL"],
        creacion_cancelada: "INICIAL",
    },
});

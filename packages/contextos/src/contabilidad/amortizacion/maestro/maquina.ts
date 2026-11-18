import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroAmortizacion, EstadoMaestroAmortizacion } from "./diseño.ts";
import * as maestro from "./maestro.ts";

export const getMaquina: () => Maquina<EstadoMaestroAmortizacion, ContextoMaestroAmortizacion> = () => ({
    INICIAL: {
        amortizacion_seleccionada: [maestro.Amortizaciones.activar],
        amortizacion_deseleccionada: [maestro.Amortizaciones.desactivar],

        amortizacion_cambiada: [maestro.Amortizaciones.cambiar],
        amortizacion_borrada: [maestro.Amortizaciones.quitar],

        recarga_de_amortizaciones_solicitada: maestro.recargarAmortizaciones,

        criteria_cambiado: [maestro.Amortizaciones.filtrar, maestro.recargarAmortizaciones],
        siguiente_pagina: [maestro.Amortizaciones.filtrar, maestro.ampliarAmortizaciones],

        crear_amortizacion_solicitado: "CREANDO",
        generar_dotaciones_solicitado: "GENERANDO",
        deshacer_dotaciones_solicitado: "DESHACIENDO",
    },

    CREANDO: {
        alta_de_amortizacion_cancelada: "INICIAL",
        amortizacion_creada: maestro.incluirAmortizacionCreadaPorId,
    },

    GENERANDO: {
        generacion_cancelada: "INICIAL",
        dotaciones_generadas: maestro.terminarProceso,
    },

    DESHACIENDO: {
        deshacer_cancelado: "INICIAL",
        dotaciones_deshechas: maestro.terminarProceso,
    },
});

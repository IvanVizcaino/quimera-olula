import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroEjercicio, EstadoMaestroEjercicio } from "./diseño.ts";
import * as maestro from "./maestro.ts";

export const getMaquina: () => Maquina<EstadoMaestroEjercicio, ContextoMaestroEjercicio> = () => ({
    INICIAL: {
        ejercicio_seleccionado: [maestro.Ejercicios.activar],
        ejercicio_deseleccionado: [maestro.Ejercicios.desactivar],
        ejercicio_cambiado: maestro.recargarTrasCambio,

        recarga_de_ejercicios_solicitada: maestro.recargarEjercicios,
        criteria_cambiado: [maestro.Ejercicios.filtrar, maestro.recargarEjercicios],
        siguiente_pagina: [maestro.Ejercicios.filtrar, maestro.ampliarEjercicios],

        crear_ejercicio_solicitado: "CREANDO",
    },

    CREANDO: {
        alta_de_ejercicio_cancelada: "INICIAL",
        ejercicio_creado: maestro.incluirEjercicioCreadoPorId,
    },
});

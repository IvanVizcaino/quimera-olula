import { Maquina } from "@olula/lib/diseño.js";
import { ContextoMaestroJornadas, EstadoMaestroJornadas } from "./diseño.ts";
import { Jornadas, ampliarJornadas, aprobarJornadas, jornadaCreada, recargarJornadas } from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoMaestroJornadas, ContextoMaestroJornadas> = () => {
    return {
        INICIAL: {
            jornada_cambiada: [Jornadas.cambiar],

            jornada_anulada: [Jornadas.quitar, Jornadas.desactivar],

            jornada_seleccionada: [Jornadas.activar],

            jornada_deseleccionada: [Jornadas.desactivar],

            recarga_de_jornadas_solicitada: recargarJornadas,

            creacion_de_jornada_solicitada: "CREANDO_JORNADA",

            criteria_cambiado: [Jornadas.filtrar, recargarJornadas],

            siguiente_pagina: [Jornadas.filtrar, ampliarJornadas],

            aprobacion_multiple_solicitada: "APROBANDO_JORNADAS",

            revision_de_firma_solicitada: "REVISANDO_JORNADAS",

            seleccionadas_cambiadas: async (ctx, payload) => ({ ...ctx, seleccionadas: payload as string[] }),
        },

        CREANDO_JORNADA: {
            jornada_creada: [jornadaCreada],

            creacion_de_jornada_cancelada: "INICIAL",
        },

        APROBANDO_JORNADAS: {
            jornadas_aprobadas: [aprobarJornadas],

            aprobacion_multiple_cancelada: "INICIAL",
        },

        REVISANDO_JORNADAS: {
            jornadas_revisadas: "INICIAL",

            revision_de_firma_cancelada: "INICIAL",
        },
    };
};

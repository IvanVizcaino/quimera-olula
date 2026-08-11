import { Maquina } from "@olula/lib/diseño.js";
import { ContextoMaestroJornadas, EstadoMaestroJornadas } from "./diseño.ts";
import { Jornadas, ampliarJornadas, iniciarJornada, jornadaCreada, recargarJornadas } from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoMaestroJornadas, ContextoMaestroJornadas> = () => {
    return {
        INICIAL: {
            jornada_cambiada: [Jornadas.cambiar],

            jornada_anulada: [Jornadas.quitar, Jornadas.desactivar],

            jornada_seleccionada: [Jornadas.activar],

            jornada_deseleccionada: [Jornadas.desactivar],

            recarga_de_jornadas_solicitada: recargarJornadas,

            creacion_de_jornada_solicitada: "CREANDO_JORNADA",

            inicio_de_jornada_solicitado: iniciarJornada,

            criteria_cambiado: [Jornadas.filtrar, recargarJornadas],

            siguiente_pagina: [Jornadas.filtrar, ampliarJornadas],
        },

        CREANDO_JORNADA: {
            jornada_creada: [jornadaCreada],

            creacion_de_jornada_cancelada: "INICIAL",
        },
    };
};

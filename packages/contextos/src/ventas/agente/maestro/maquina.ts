import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroAgente, EstadoMaestroAgente } from "./diseño.js";
import * as maestro from "./maestro.js";

export const getMaquina: () => Maquina<EstadoMaestroAgente, ContextoMaestroAgente> = () => {
    return {
        INICIAL: {
            agente_seleccionado: [maestro.Agentes.activar],
            agente_deseleccionado: [maestro.Agentes.desactivar],

            agente_cambiado: [maestro.Agentes.cambiar],

            recarga_de_agentes_solicitada: maestro.recargarAgentes,

            criteria_cambiado: [maestro.Agentes.filtrar, maestro.recargarAgentes],

            siguiente_pagina: [maestro.Agentes.filtrar, maestro.ampliarAgentes],

            crear_agente_solicitado: "CREANDO",
        },

        CREANDO: {
            alta_de_agente_cancelada: "INICIAL",

            agente_creado: maestro.incluirAgenteCreadoPorId,
        },
    };
};

import { Maquina } from "@olula/lib/diseño.js";
import { ContextoMaestroOportunidades, EstadoMaestroOportunidades } from "./diseño.ts";
import { ampliarOportunidades, cambiarEstadoOportunidad, Oportunidades, recargarOportunidades } from "./maestro.ts";

export const getMaquina: () => Maquina<EstadoMaestroOportunidades, ContextoMaestroOportunidades> = () => {
    return {
        INICIAL: {
            oportunidad_cambiada: [Oportunidades.cambiar],

            oportunidad_seleccionada: [Oportunidades.activar],

            oportunidad_deseleccionada: Oportunidades.desactivar,

            oportunidad_borrada: Oportunidades.quitar,

            estado_oportunidad_cambiado: cambiarEstadoOportunidad,

            recarga_de_oportunidades_solicitada: recargarOportunidades,

            criteria_cambiado: [Oportunidades.filtrar, recargarOportunidades],

            siguiente_pagina: [Oportunidades.filtrar, ampliarOportunidades],

            creacion_de_oportunidad_solicitada: "CREANDO",
        },
        CREANDO: {
            creacion_oportunidad_cancelada: "INICIAL",

            oportunidad_creada: [Oportunidades.incluir, Oportunidades.activar, "INICIAL"],
        }
    }
}

import { Maquina } from "@olula/lib/diseño.js";
import { ContextoMaestroAcciones, EstadoMaestroAcciones } from "./diseño.ts";
import { Acciones, ampliarAcciones, finalizarAccionRapida, recargarAcciones } from "./maestro.ts";

export const getMaquina: () => Maquina<EstadoMaestroAcciones, ContextoMaestroAcciones> = () => {
    return {
        INICIAL: {
            accion_cambiada: [Acciones.cambiar],

            accion_seleccionada: [Acciones.activar],

            accion_deseleccionada: Acciones.desactivar,

            accion_borrada: Acciones.quitar,

            accion_finalizada_rapido: finalizarAccionRapida,

            recarga_de_acciones_solicitada: recargarAcciones,

            criteria_cambiado: [Acciones.filtrar, recargarAcciones],

            siguiente_pagina: [Acciones.filtrar, ampliarAcciones],

            creacion_de_accion_solicitada: "CREANDO",
        },
        CREANDO: {
            creacion_accion_cancelada: "INICIAL",

            accion_creada: [Acciones.incluir, Acciones.activar, "INICIAL"],
        },
    }
}

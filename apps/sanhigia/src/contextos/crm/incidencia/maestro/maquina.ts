import { Maquina } from "@olula/lib/diseño.js";
import { ContextoMaestroIncidencias, EstadoMaestroIncidencias } from "./diseño.ts";
import { Incidencias, recargarIncidencias } from "./maestro.ts";

export const getMaquina: () => Maquina<EstadoMaestroIncidencias, ContextoMaestroIncidencias> = () => {
    return {
        INICIAL: {
            incidencia_cambiada: [Incidencias.cambiar],

            incidencia_seleccionada: [Incidencias.activar],

            incidencia_deseleccionada: Incidencias.desactivar,

            incidencia_borrada: Incidencias.quitar,

            recarga_de_incidencias_solicitada: recargarIncidencias,

            criteria_cambiado: [Incidencias.filtrar, recargarIncidencias],

            creacion_de_incidencia_solicitada: "CREANDO",
        },
        CREANDO: {
            creacion_incidencia_cancelada: "INICIAL",

            incidencia_creada: [Incidencias.incluir, Incidencias.activar, "INICIAL"],
        }
    }
}

import { Maquina } from "@olula/lib/diseño.js";
import { Acciones, recargarAcciones } from "./acciones.ts";
import { ContextoAccionesCliente, EstadoAccionesCliente } from "./diseño.ts";

export const getMaquina: () => Maquina<EstadoAccionesCliente, ContextoAccionesCliente> = () => {
    return {
        INICIAL: {
            accion_cambiada: [Acciones.cambiar],

            accion_seleccionada: [Acciones.activar],

            accion_deseleccionada: Acciones.desactivar,

            accion_borrada: Acciones.quitar,

            recarga_de_acciones_solicitada: [recargarAcciones],

            creacion_de_accion_solicitada: "CREANDO",

            edicion_accion_solicitada: "EDITANDO",

            borrado_accion_solicitado: "BORRANDO",
        },
        EDITANDO: {
            accion_cambiada: [Acciones.cambiar],

            accion_seleccionada: [Acciones.activar],

            accion_deseleccionada: [Acciones.desactivar, "INICIAL"],

            accion_borrada: [Acciones.quitar, "INICIAL"],

            borrado_accion_solicitado: "BORRANDO",
        },
        CREANDO: {
            creacion_accion_cancelada: "INICIAL",

            accion_creada: [Acciones.incluir, Acciones.activar, "INICIAL"],
        },
        BORRANDO: {
            borrado_accion_cancelado: "INICIAL",

            accion_borrada: [Acciones.quitar, "INICIAL"],
        }
    }
}

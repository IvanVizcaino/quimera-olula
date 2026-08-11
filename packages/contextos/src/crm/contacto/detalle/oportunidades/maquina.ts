import { Maquina } from "@olula/lib/diseño.js";
import { ContextoOportunidadesContacto, EstadoOportunidadesContacto } from "./diseño.ts";
import { Oportunidades, recargarOportunidades } from "./oportunidades.ts";

export const getMaquina: () => Maquina<EstadoOportunidadesContacto, ContextoOportunidadesContacto> = () => {
    return {
        INICIAL: {
            oportunidad_cambiada: [Oportunidades.cambiar],

            oportunidad_seleccionada: [Oportunidades.activar],

            oportunidad_deseleccionada: Oportunidades.desactivar,

            oportunidad_borrada: Oportunidades.quitar,

            recarga_de_oportunidades_solicitada: [recargarOportunidades],

            creacion_de_oportunidad_solicitada: "CREANDO",

            edicion_oportunidad_solicitada: "EDITANDO",

            borrado_oportunidad_solicitado: "BORRANDO",
        },
        EDITANDO: {
            oportunidad_cambiada: [Oportunidades.cambiar],

            oportunidad_seleccionada: [Oportunidades.activar],

            oportunidad_deseleccionada: [Oportunidades.desactivar, "INICIAL"],

            oportunidad_borrada: [Oportunidades.quitar, "INICIAL"],

            borrado_oportunidad_solicitado: "BORRANDO",
        },
        CREANDO: {
            creacion_oportunidad_cancelada: "INICIAL",

            oportunidad_creada: [Oportunidades.incluir, Oportunidades.activar, "INICIAL"],
        },
        BORRANDO: {
            borrado_oportunidad_cancelado: "INICIAL",

            oportunidad_borrada: [Oportunidades.quitar, "INICIAL"],
        }
    }
}

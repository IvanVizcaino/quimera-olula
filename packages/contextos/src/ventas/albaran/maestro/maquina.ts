import { Maquina } from "@olula/lib/diseño.js";
import { ContextoMaestroAlbaran, EstadoMaestroAlbaran } from "./diseño.ts";
import { Albaranes, ampliarAlbaranes, recargarAlbaranes } from "./maestro.ts";


export const getMaquina: () => Maquina<EstadoMaestroAlbaran, ContextoMaestroAlbaran> = () => {

    return {

        INICIAL: {

            albaran_cambiado: Albaranes.cambiar,

            albaran_seleccionado: [Albaranes.activar],

            albaran_deseleccionado: Albaranes.desactivar,

            albaran_borrado: Albaranes.quitar,

            albaran_creado: Albaranes.incluir,

            recarga_de_albaranes_solicitada: recargarAlbaranes,

            criteria_cambiado: [Albaranes.filtrar, recargarAlbaranes],

            siguiente_pagina: [Albaranes.filtrar, ampliarAlbaranes],

            crear_albaran_solicitado: "CREANDO_ALBARAN",
        },

        CREANDO_ALBARAN: {

            albaran_creado: [Albaranes.incluir, 'INICIAL'],

            creacion_cancelada: "INICIAL",
        },
    }
}

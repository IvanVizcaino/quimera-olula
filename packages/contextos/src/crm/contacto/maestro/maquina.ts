import { Maquina } from "@olula/lib/diseño.js";
import { ContextoMaestroContactos, EstadoMaestroContactos } from "./diseño.ts";
import { ampliarContactos, Contactos, recargarContactos } from "./maestro.ts";

export const getMaquina: () => Maquina<EstadoMaestroContactos, ContextoMaestroContactos> = () => {
    return {
        INICIAL: {
            contacto_cambiado: [Contactos.cambiar],

            contacto_seleccionado: [Contactos.activar],

            contacto_deseleccionado: Contactos.desactivar,

            contacto_borrado: Contactos.quitar,

            recarga_de_contactos_solicitada: recargarContactos,

            criteria_cambiado: [Contactos.filtrar, recargarContactos],

            siguiente_pagina: [Contactos.filtrar, ampliarContactos],

            creacion_de_contacto_solicitada: "CREANDO",
        },
        CREANDO: {
            creacion_contacto_cancelada: "INICIAL",

            contacto_creado: [Contactos.incluir, Contactos.activar, "INICIAL"],
        }
    }
}

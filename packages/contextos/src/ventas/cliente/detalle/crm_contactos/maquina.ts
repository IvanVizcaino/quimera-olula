import { Maquina } from "@olula/lib/diseño.js";
import { ContextoCrmContactos, EstadoCrmContactos } from "./diseño.ts";
import {
    activarContacto,
    actualizarContacto,
    borrarContacto,
    cancelarAlta,
    cancelarConfirmacion,
    cancelarEdicion,
    cargarCrmContactos,
    crearContacto,
    desvincularContacto,
    vincularContacto,
} from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoCrmContactos, ContextoCrmContactos> = () => {

    return {

        lista: {
            cargar_contactos: cargarCrmContactos,

            alta_solicitada: "alta",

            edicion_solicitada: "edicion",

            edicion_cancelada: "lista",

            contacto_seleccionado: activarContacto,

            borrado_solicitado: "confirmar_borrado",

            eliminar_asociacion: "confirmar_eliminar_asociacion",

            asociar_solicitado: "asociar",
        },

        alta: {
            crear_contacto: [crearContacto, "lista"],

            alta_cancelada: cancelarAlta,
        },

        edicion: {
            actualizar_contacto: [actualizarContacto],

            edicion_cancelada: cancelarEdicion,
        },

        confirmar_borrado: {
            borrado_confirmado: borrarContacto,

            borrado_cancelado: cancelarConfirmacion,
        },

        confirmar_eliminar_asociacion: {
            eliminacion_solicitada: desvincularContacto,

            eliminacion_cancelada: cancelarConfirmacion,
        },

        asociar: {
            vinculacion_solicitada: [vincularContacto, "lista"],

            asociacion_cancelada: cancelarConfirmacion,
        },
    }
}

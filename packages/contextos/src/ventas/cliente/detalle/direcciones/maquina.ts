import { Maquina } from "@olula/lib/diseño.js";
import { ContextoDirecciones, EstadoDirecciones } from "./diseño.ts";
import {
    activarDireccion,
    borrarDireccion,
    cancelarAlta,
    cancelarConfirmacion,
    cancelarEdicion,
    cargarDirecciones,
    direccionActualizada,
    direccionCreada,
    marcarDireccionEnvio,
    marcarDireccionFacturacion,
} from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoDirecciones, ContextoDirecciones> = () => {

    return {

        lista: {
            cargar_direcciones: cargarDirecciones,

            alta_solicitada: "alta",

            edicion_solicitada: "edicion",

            direccion_seleccionada: activarDireccion,

            borrado_solicitado: "confirmar_borrado",

            facturacion_solicitada: marcarDireccionFacturacion,

            envio_solicitada: marcarDireccionEnvio,

            direccion_creada: direccionCreada,

            direccion_actualizada: direccionActualizada,

            borrado_de_direccion_listo: borrarDireccion,
        },

        alta: {
            direccion_creada: direccionCreada,

            alta_cancelada: cancelarAlta,
        },

        edicion: {
            direccion_actualizada: direccionActualizada,

            edicion_cancelada: cancelarEdicion,
        },

        confirmar_borrado: {
            borrado_confirmado: borrarDireccion,

            borrado_cancelado: cancelarConfirmacion,
        },
    }
}

import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { alternarActivoIaFlujo, cargarContexto, refrescarIaFlujo } from "./detalle.js";
import { ContextoDetalleIaFlujo, EstadoDetalleIaFlujo } from "./diseño.js";

/**
 * Máquina de estados para la vista detalle.
 */
export const getMaquina: () => Maquina<EstadoDetalleIaFlujo, ContextoDetalleIaFlujo> = () => {
    return {
        INICIAL: {
            // Cuando llega un nuevo ID (por prop del maestro)
            id_cambiado: [cargarContexto],

            // Cuando se deselecciona desde el maestro
            ia_flujo_deseleccionado: [
                publicar('ia_flujo_deseleccionado', null),
            ],
        },

        ABIERTO: {
            // Cambio guardado en API (por auto-guardado de useModelo)
            ia_flujo_guardado: [refrescarIaFlujo],

            // Activar modal de borrado
            borrado_solicitado: "BORRANDO",

            // Alternar activo/inactivo (acción de máquina, no campo de formulario)
            activo_alternado_solicitado: [alternarActivoIaFlujo],

            // El detalle puede recargar la entidad
            id_cambiado: [cargarContexto],
        },

        BORRANDO: {
            // El modal confirmó el borrado; notifica al maestro y limpia el contexto
            ia_flujo_borrado: [
                publicar('ia_flujo_borrado', null),
                "INICIAL",
            ],

            // El modal canceló
            borrado_cancelado: "ABIERTO",
        },
    };
};

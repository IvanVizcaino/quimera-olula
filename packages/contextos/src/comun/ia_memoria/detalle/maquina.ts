import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { alternarActivoIaMemoria, cargarContexto, refrescarIaMemoria } from "./detalle.js";
import { ContextoDetalleIaMemoria, EstadoDetalleIaMemoria } from "./diseño.js";

/**
 * Máquina de estados para la vista detalle.
 */
export const getMaquina: () => Maquina<EstadoDetalleIaMemoria, ContextoDetalleIaMemoria> = () => {
    return {
        INICIAL: {
            // Cuando llega un nuevo ID (por prop del maestro)
            id_cambiado: [cargarContexto],

            // Cuando se deselecciona desde el maestro
            ia_memoria_deseleccionada: [
                publicar('ia_memoria_deseleccionada', null),
            ],
        },

        ABIERTO: {
            // Cambio guardado en API (por auto-guardado de useModelo)
            ia_memoria_guardada: [refrescarIaMemoria],

            // Activar modal de borrado
            borrado_solicitado: "BORRANDO",

            // Alternar activo/inactivo (acción de máquina, no campo de formulario)
            activo_alternado_solicitado: [alternarActivoIaMemoria],

            // El detalle puede recargar la entidad
            id_cambiado: [cargarContexto],
        },

        BORRANDO: {
            // El modal confirmó el borrado; notifica al maestro y limpia el contexto
            ia_memoria_borrada: [
                publicar('ia_memoria_borrada', null),
                "INICIAL",
            ],

            // El modal canceló
            borrado_cancelado: "ABIERTO",
        },
    };
};

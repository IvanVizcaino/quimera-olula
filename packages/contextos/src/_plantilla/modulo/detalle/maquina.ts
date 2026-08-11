import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { cargarContexto, refrescarModulo } from "./detalle.js";
import { ContextoDetalleModulo, EstadoDetalleModulo } from "./diseño.js";

/**
 * Máquina de estados para la vista detalle.
 *
 * Patrón de transiciones:
 *   - string                    → transición simple de estado (sin efecto)
 *   - [fn, fn, ...]             → cadena de procesadores (pipe implícito)
 *   - [fn, fn, ..., "ESTADO"]   → pipe + cambio de estado al final
 *   - fn sola                   → procesador directo (puede devolver nuevo estado)
 *
 * Patrón de modales:
 *   - El estado BORRANDO activa el modal de borrado en la vista.
 *   - El modal emite el evento de resultado y el estado vuelve a ABIERTO o INICIAL.
 */
export const getMaquina: () => Maquina<EstadoDetalleModulo, ContextoDetalleModulo> = () => {
    return {
        INICIAL: {
            // Cuando llega un nuevo ID (por prop del maestro)
            modulo_id_cambiado: [cargarContexto],

            // Cuando se deselecciona desde el maestro
            modulo_deseleccionado: [
                publicar('modulo_deseleccionado', null),
            ],
        },

        ABIERTO: {
            // Cambio guardado en API (por auto-guardado de useModelo)
            modulo_guardado: [refrescarModulo],

            // Activar modal de borrado
            borrado_solicitado: "BORRANDO",

            // El detalle puede recargar la entidad (ej. tras acción externa)
            modulo_id_cambiado: [cargarContexto],
        },

        BORRANDO: {
            // El modal confirmó el borrado; notifica al maestro y limpia el contexto
            modulo_borrado: [
                publicar('modulo_borrado', null),
                "INICIAL",
            ],

            // El modal canceló
            borrado_cancelado: "ABIERTO",
        },
    };
};

import { Modulo } from "../diseño.js";

/**
 * Estados posibles en la vista de detalle.
 */
export type EstadoDetalleModulo =
    | 'INICIAL'
    | 'ABIERTO'
    | 'BORRANDO';

/**
 * Contexto del detalle (edición de un módulo)
 */
export type ContextoDetalleModulo = {
    estado: EstadoDetalleModulo;
    modulo: Modulo;
};

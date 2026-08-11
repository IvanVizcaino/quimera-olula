import { IaMemoria } from "../diseño.js";

/**
 * Estados posibles en la vista de detalle.
 */
export type EstadoDetalleIaMemoria =
    | 'INICIAL'
    | 'ABIERTO'
    | 'BORRANDO';

/**
 * Contexto del detalle (edición de una memoria del asistente)
 */
export type ContextoDetalleIaMemoria = {
    estado: EstadoDetalleIaMemoria;
    iaMemoria: IaMemoria;
};

import { IaFlujo } from "../diseño.js";

/**
 * Estados posibles en la vista de detalle.
 */
export type EstadoDetalleIaFlujo =
    | 'INICIAL'
    | 'ABIERTO'
    | 'BORRANDO';

/**
 * Contexto del detalle (edición de un flujo de trabajo)
 */
export type ContextoDetalleIaFlujo = {
    estado: EstadoDetalleIaFlujo;
    iaFlujo: IaFlujo;
};

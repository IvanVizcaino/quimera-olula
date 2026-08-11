import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { IaFlujo } from "../diseño.js";

/**
 * Estados posibles del maestro.
 */
export type EstadoMaestroIaFlujo = 'INICIAL' | 'CREANDO';

/**
 * Contexto del maestro (listado de flujos)
 */
export type ContextoMaestroIaFlujo = {
    estado: EstadoMaestroIaFlujo;
    iaFlujos: ListaActivaEntidades<IaFlujo>;
};

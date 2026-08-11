import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { IaMemoria } from "../diseño.js";

/**
 * Estados posibles del maestro.
 */
export type EstadoMaestroIaMemoria = 'INICIAL' | 'CREANDO';

/**
 * Contexto del maestro (listado de memorias)
 */
export type ContextoMaestroIaMemoria = {
    estado: EstadoMaestroIaMemoria;
    iaMemorias: ListaActivaEntidades<IaMemoria>;
};

import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Modulo } from "../diseño.js";

/**
 * Estados posibles del maestro.
 */
export type EstadoMaestroModulo = 'INICIAL' | 'CREANDO';

/**
 * Contexto del maestro (listado de módulos)
 */
export type ContextoMaestroModulo = {
    estado: EstadoMaestroModulo;
    modulos: ListaActivaEntidades<Modulo>;
};

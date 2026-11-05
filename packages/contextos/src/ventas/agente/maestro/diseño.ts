import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Agente } from "../diseño.js";

export type EstadoMaestroAgente = 'INICIAL' | 'CREANDO';

export type ContextoMaestroAgente = {
    estado: EstadoMaestroAgente;
    agentes: ListaActivaEntidades<Agente>;
};

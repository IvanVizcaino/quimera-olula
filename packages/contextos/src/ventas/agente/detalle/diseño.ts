import { Agente } from "../diseño.js";

export type EstadoDetalleAgente =
    | 'INICIAL'
    | 'ABIERTO';

export type ContextoDetalleAgente = {
    estado: EstadoDetalleAgente;
    agente: Agente;
};

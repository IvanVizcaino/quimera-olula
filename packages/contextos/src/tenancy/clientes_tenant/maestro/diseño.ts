import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { ClienteTenant } from "../diseño.js";

export type EstadoMaestroClienteTenant = 'INICIAL' | 'CREANDO';

export type ContextoMaestroClienteTenant = {
    estado: EstadoMaestroClienteTenant;
    clientes: ListaActivaEntidades<ClienteTenant>;
};

import { Cliente } from "../diseño.ts";

export type EstadoCliente =
    | "INICIAL"
    | "ABIERTO"
    | "BAJANDO_CLIENTE"
    | "BORRANDO_CLIENTE"
    | "CAMBIANDO_ID_FISCAL"

export type ContextoCliente = {
    estado: EstadoCliente;
    cliente: Cliente;
    clienteInicial: Cliente;
};
import { ReactNode } from "react";
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
/**
 * Pestaña que una app añade al detalle de cliente, detrás de las de la base.
 * `contenido` recibe el cliente abierto.
 */
export type TabAdicionalCliente = {
    id: string;
    label: string;
    contenido: (cliente: Cliente) => ReactNode;
};

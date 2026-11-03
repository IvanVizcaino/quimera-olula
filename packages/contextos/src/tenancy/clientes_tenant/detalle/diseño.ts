import { ClienteTenant } from "../diseño.js";

export type EstadoDetalleClienteTenant = 'INICIAL' | 'ABIERTO' | 'BORRANDO';

export type ContextoDetalleClienteTenant = {
    estado: EstadoDetalleClienteTenant;
    cliente: ClienteTenant;
};

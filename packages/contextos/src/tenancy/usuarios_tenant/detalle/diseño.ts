import { UsuarioTenant } from "../diseño.js";

export type EstadoDetalleUsuarioTenant = 'INICIAL' | 'ABIERTO' | 'BORRANDO';

export type ContextoDetalleUsuarioTenant = {
    estado: EstadoDetalleUsuarioTenant;
    usuario: UsuarioTenant;
};

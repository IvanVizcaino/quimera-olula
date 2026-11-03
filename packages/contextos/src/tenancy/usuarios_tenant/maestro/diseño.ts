import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { UsuarioTenant } from "../diseño.js";

export type EstadoMaestroUsuarioTenant = 'INICIAL' | 'CREANDO';

export type ContextoMaestroUsuarioTenant = {
    estado: EstadoMaestroUsuarioTenant;
    usuarios: ListaActivaEntidades<UsuarioTenant>;
};

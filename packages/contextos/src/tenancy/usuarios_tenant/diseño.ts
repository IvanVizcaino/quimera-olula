import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

export interface UsuarioTenant extends Entidad {
    id: string;
    email: string;
    nombre: string;
    clienteId: string;
    activo: boolean;
}

export interface NuevoUsuarioTenant extends Modelo {
    id: string;
    email: string;
    nombre: string;
    clienteId: string;
    activo: boolean;
}

export type CambiosUsuarioTenant = Partial<UsuarioTenant>;

export type GetUsuarioTenant = (id: string) => Promise<UsuarioTenant>;
export type GetUsuariosTenant = (criteria: Criteria) => RespuestaLista<UsuarioTenant>;
export type PostUsuarioTenant = (nuevo: NuevoUsuarioTenant) => Promise<string>;
export type PatchUsuarioTenant = (id: string, cambios: CambiosUsuarioTenant) => Promise<void>;
export type DeleteUsuarioTenant = (id: string) => Promise<void>;

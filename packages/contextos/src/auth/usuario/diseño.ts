import { Entidad, Filtro, Orden, Paginacion, RespuestaLista2 } from "@olula/lib/diseño.ts";

export interface Usuario extends Entidad {
  id: string;
  nombre: string;
  email: string;
  grupo_id: string;
  empresas?: string[];
};

export interface UsuarioApi {
  id: string;
  nombre: string;
  email: string;
  grupo_id: string;
  empresas?: string[];
};


export type GetUsuarios = (f: Filtro, o: Orden, p?: Paginacion) => Promise<RespuestaLista2<Usuario>>;

export interface UsuarioAPI extends Entidad {
  id: string;
  nombre: string;
  email: string;
  grupo_id: string;
  empresas?: string[];
}

export type GetUsuario = (id: string) => Promise<Usuario>;
export type GetTokenUsuario = (id: string) => Promise<string>;


export type PostUsuario = (usuario: Partial<Usuario>) => Promise<string>;
export type PatchUsuario = (id: string, usuario: Partial<Usuario>) => Promise<void>;
export type DeleteUsuario = (id: string) => Promise<void>;
export type GenerarTokenUsuario = (id: string, expiracion: string) => Promise<string>;

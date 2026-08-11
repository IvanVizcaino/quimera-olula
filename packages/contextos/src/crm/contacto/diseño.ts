import { Entidad, Filtro, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";
import type { NuevoContacto } from "./crear/diseño.ts";


export interface Contacto extends Entidad {
  id: string;
  nombre: string;
  email: string;
  nif?: string
  telefono1?: string;
};

export type CambiosContacto = Partial<Contacto>;

export type GetContacto = (id: string) => Promise<Contacto>;

export type GetContactos = (filtro: Filtro, orden: Orden, paginacion: Paginacion) => RespuestaLista<Contacto>;

export type PostContacto = (nuevoContacto: NuevoContacto) => Promise<string>;

export type PatchContacto = (id: string, contacto: Contacto) => Promise<void>;

export type DeleteContacto = (id: string) => Promise<void>;
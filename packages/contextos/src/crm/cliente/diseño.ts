import { Entidad, Filtro, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";

export interface Cliente extends Entidad {
  id: string;
  nombre: string;
  nombre_comercial: string | null;
  id_fiscal: string;
  agente_id: string | null;
  nombre_agente: string | null;
  tipo_id_fiscal: string;
  grupo_iva_negocio_id: string;
  grupo_id: string;
  telefono1: string;
  telefono2: string;
  email: string;
  web: string;
  observaciones: string;
  contacto_id: string;
};

export interface IdFiscal {
  id_fiscal: string;
  tipo_id_fiscal: string;
}

export type GetCliente = (id: string) => Promise<Cliente>;
export type GetClientes = (filtro: Filtro, orden: Orden, paginacion: Paginacion) => RespuestaLista<Cliente>;
export type PatchCliente = (id: string, cliente: Cliente) => Promise<void>;
export type DeleteCliente = (id: string) => Promise<void>;
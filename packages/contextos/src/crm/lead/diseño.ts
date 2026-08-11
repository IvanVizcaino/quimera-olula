import { Entidad, Filtro, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";
import type { NuevoLead } from "./crear/diseño.ts";

export interface Lead extends Entidad {
    id: string;
    tipo: string;
    estado_id: string;
    estado: string;
    nombre: string;
    id_fiscal: string | null;
    cliente_id: string;
    proveedor_id: string | null;
    direccion: string;
    cod_postal: string | null;
    ciudad: string;
    provincia_id: string | null;
    provincia: string;
    pais_id: string;
    pais: string | null;
    telefono_1: string;
    telefono_2: string;
    email: string;
    web: string;
    contacto_id: string;
    contacto?: ContactoLead | null;
    fuente_id: string;
    fuente: string;
    responsable_id: string;
}

export interface LeadAPI extends Entidad {
    id: string;
    tipo: string;
    estado_id: string;
    estado: string;
    nombre: string;
    id_fiscal: string;
    cliente_id: string;
    proveedor_id: string;
    direccion: DireccionLeadAPI;
    email: string;
    web: string;
    contacto_id: string;
    contacto?: ContactoLeadAPI | null;
    fuente_id: string;
    fuente: string;
    responsable_id: string;
}

export type ContactoLead = {
    nombre: string;
};

export type ContactoLeadAPI = {
    nombre: string | null;
};

export type LeadToAPI = Omit<LeadAPI, "direccion"> & {
    direccion: DireccionLead;
};

export type DireccionLead = {
    nombre_via: string;
    cod_postal: string;
    ciudad: string;
    provincia_id: string | null;
    provincia: string;
    pais_id: string;
    pais: string;
    telefono: string;
    tipo_via: string;
    numero: string;
    otros: string;
    apartado: string;
};

export type DireccionLeadAPI = {
    direccion: string;
    cod_postal: string;
    ciudad: string;
    provincia_id: string | null;
    provincia: string;
    pais_id: string;
    pais: string;
    telefono_1: string;
    telefono_2: string;
    tipo_via: string;
    numero: string;
    otros: string;
    apartado: string;
};

export type CambiosLead = Partial<Lead>;

export type GetLead = (id: string) => Promise<Lead>;

export type GetLeads = (filtro: Filtro, orden: Orden, paginacion: Paginacion) => RespuestaLista<Lead>;

export type PostLead = (lead: NuevoLead) => Promise<string>;

export type PatchLead = (id: string, lead: CambiosLead) => Promise<void>;

export type DeleteLead = (id: string) => Promise<void>;

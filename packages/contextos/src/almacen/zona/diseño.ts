import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

export interface Zona extends Entidad {
    id: string;
    codigo: string;
    almacenId: string;
    descripcion: string | null;
}

export interface NuevaZona extends Modelo {
    codigo: string;
    almacenId: string;
    descripcion: string | null;
}

export type CambiosZona = Partial<Zona>;

export type GetZona = (id: string) => Promise<Zona>;
export type GetZonas = (criteria: Criteria) => RespuestaLista<Zona>;
export type PostZona = (nuevaZona: NuevaZona) => Promise<string>;
export type PatchZona = (id: string, cambios: CambiosZona) => Promise<void>;
export type DeleteZona = (id: string) => Promise<void>;

import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

export type FuncionZona =
    | "RECEPCION"
    | "CUARENTENA"
    | "RESERVA"
    | "PICKING"
    | "PREPARACION"
    | "EXPEDICION"
    | "TRANSITO";

export interface Zona extends Entidad {
    id: string;
    codigo: string;
    almacenId: string;
    descripcion: string | null;
    funcion: FuncionZona;
    /** Ids de las clases de almacenamiento que admite la zona. */
    clasesAdmitidas: string[];
    admiteSinClase: boolean;
}

export interface NuevaZona extends Modelo {
    codigo: string;
    almacenId: string;
    descripcion: string | null;
    funcion: FuncionZona;
}

export type CambiosZona = Partial<Zona>;

export type GetZona = (id: string) => Promise<Zona>;
export type GetZonas = (criteria: Criteria) => RespuestaLista<Zona>;
export type PostZona = (nuevaZona: NuevaZona) => Promise<string>;
export type PatchZona = (id: string, cambios: CambiosZona) => Promise<void>;
export type DeleteZona = (id: string) => Promise<void>;

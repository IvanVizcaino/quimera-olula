import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

export interface ClaseAlmacenamiento extends Entidad {
    id: string;
    codigo: string;
    descripcion: string;
}

export interface NuevaClaseAlmacenamiento extends Modelo {
    codigo: string;
    descripcion: string;
}

export type CambiosClaseAlmacenamiento = Partial<ClaseAlmacenamiento>;

export type GetClaseAlmacenamiento = (id: string) => Promise<ClaseAlmacenamiento>;
export type GetClasesAlmacenamiento = (criteria: Criteria) => RespuestaLista<ClaseAlmacenamiento>;
export type PostClaseAlmacenamiento = (nueva: NuevaClaseAlmacenamiento) => Promise<string>;
export type PatchClaseAlmacenamiento = (id: string, cambios: CambiosClaseAlmacenamiento) => Promise<void>;
export type DeleteClaseAlmacenamiento = (id: string) => Promise<void>;

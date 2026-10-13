import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

/** Subfamilia de artículo (ext. oficial `subfamilias`, T2.8).
 * Tablas Eneboo: `subfamilias(codsubfamilia, descripcion, codfamilia)`.
 */
export interface Subfamilia extends Entidad {
    id: string;
    descripcion: string;
    familiaId: string;
    descripcionFamilia: string | null;
}

export interface NuevaSubfamilia extends Modelo {
    id: string;
    descripcion: string;
    familiaId: string;
}

export type CambiosSubfamilia = Pick<Subfamilia, "descripcion">;

export type GetSubfamilia = (id: string) => Promise<Subfamilia>;
export type GetSubfamilias = (criteria: Criteria) => RespuestaLista<Subfamilia>;
export type PostSubfamilia = (nueva: NuevaSubfamilia) => Promise<string>;
export type PatchSubfamilia = (id: string, cambios: CambiosSubfamilia) => Promise<void>;
export type DeleteSubfamilia = (id: string) => Promise<void>;

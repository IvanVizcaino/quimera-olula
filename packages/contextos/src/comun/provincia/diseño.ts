import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

export type DatosProvincia = {
    nombre: string;
    paisId: string;
    codigo: string;
};

/** Eneboo `provincias` (clave serial `idprovincia`). */
export interface Provincia extends Entidad, DatosProvincia {
    id: string;
    nombrePais: string;
}

export type NuevaProvincia = DatosProvincia & Modelo;

export type CambiosProvincia = Partial<DatosProvincia>;

export type GetProvinciasMaestro = (criteria: Criteria) => RespuestaLista<Provincia>;
export type GetProvincia = (id: string) => Promise<Provincia>;
export type PostProvincia = (nueva: NuevaProvincia) => Promise<string>;
export type PatchProvincia = (id: string, cambios: CambiosProvincia) => Promise<void>;
export type DeleteProvincia = (id: string) => Promise<void>;

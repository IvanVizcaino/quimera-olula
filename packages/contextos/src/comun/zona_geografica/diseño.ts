import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

export type DatosZonaGeografica = {
    id: string;
    descripcion: string;
};

/** Eneboo `zonasgeo`. */
export interface ZonaGeografica extends Entidad, DatosZonaGeografica {
    id: string;
}

export type NuevaZonaGeografica = DatosZonaGeografica & Modelo;

export type CambiosZonaGeografica = { descripcion?: string };

export type GetZonasGeograficasMaestro = (criteria: Criteria) => RespuestaLista<ZonaGeografica>;
export type GetZonaGeografica = (id: string) => Promise<ZonaGeografica>;
export type PostZonaGeografica = (nueva: NuevaZonaGeografica) => Promise<string>;
export type PatchZonaGeografica = (id: string, cambios: CambiosZonaGeografica) => Promise<void>;
export type DeleteZonaGeografica = (id: string) => Promise<void>;

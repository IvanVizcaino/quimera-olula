import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

export type DatosPais = {
    id: string;
    nombre: string;
    codiso: string;
    codigoIsoAlpha2: string;
    codigoIsoAlpha3: string;
    enUe: boolean;
    zonaId: string;
    zonaSepa: boolean;
    validarProvincias: boolean;
    exigirValidacion: boolean;
    funcionValidacion: string;
};

/** Eneboo `paises` (sin la bandera). */
export interface Pais extends Entidad, DatosPais {
    id: string;
    descripcionZona: string;
}

export type NuevoPais = DatosPais & Modelo;

export type CambiosPais = Partial<Omit<DatosPais, "id">>;

export type GetPaisesMaestro = (criteria: Criteria) => RespuestaLista<Pais>;
export type GetPais = (id: string) => Promise<Pais>;
export type PostPais = (nuevo: NuevoPais) => Promise<string>;
export type PatchPais = (id: string, cambios: CambiosPais) => Promise<void>;
export type DeletePais = (id: string) => Promise<void>;

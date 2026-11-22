import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

export type FormatoUbicacion = "HUECO_PALET" | "ESTANTE" | "SUELO" | "PLAYA";

export interface TipoUbicacion extends Entidad {
    id: string;
    codigo: string;
    descripcion: string;
    formato: FormatoUbicacion;
    capacidadPalets: number | null;
    pesoMax: number | null;
    alturaMax: number | null;
    multiReferencia: boolean;
    multiLote: boolean;
}

export interface NuevoTipoUbicacion extends Modelo {
    codigo: string;
    descripcion: string;
    formato: FormatoUbicacion;
    capacidadPalets: number | null;
    pesoMax: number | null;
    alturaMax: number | null;
    multiReferencia: boolean;
    multiLote: boolean;
}

export type CambiosTipoUbicacion = Partial<TipoUbicacion>;

export type GetTipoUbicacion = (id: string) => Promise<TipoUbicacion>;
export type GetTiposUbicacion = (criteria: Criteria) => RespuestaLista<TipoUbicacion>;
export type PostTipoUbicacion = (nuevo: NuevoTipoUbicacion) => Promise<string>;
export type PatchTipoUbicacion = (id: string, cambios: CambiosTipoUbicacion) => Promise<void>;
export type DeleteTipoUbicacion = (id: string) => Promise<void>;

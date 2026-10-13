import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

/**
 * Tarjeta de fidelización por puntos (plugin `puntos_tpv`, T7.5).
 * Tablas Eneboo: `tpv_tarjetaspuntos`.
 */
export interface TarjetaPuntos extends Entidad {
    id: string;
    nombre: string;
    idFiscal: string;
    direccion: string;
    codPostal: string | null;
    ciudad: string | null;
    provincia: string | null;
    activa: boolean;
    saldo: number;
}

export interface NuevaTarjetaPuntos extends Modelo {
    id: string;
    nombre: string;
    idFiscal: string;
    direccion: string;
    codPostal?: string | null;
    ciudad?: string | null;
    provincia?: string | null;
}

export type CambiosTarjetaPuntos = Partial<Pick<TarjetaPuntos, "nombre" | "idFiscal" | "direccion" | "codPostal" | "ciudad" | "provincia" | "activa">>;

export type GetTarjetaPuntos = (id: string) => Promise<TarjetaPuntos>;
export type GetTarjetasPuntos = (criteria: Criteria) => RespuestaLista<TarjetaPuntos>;
export type PostTarjetaPuntos = (nueva: NuevaTarjetaPuntos) => Promise<string>;
export type PatchTarjetaPuntos = (id: string, cambios: CambiosTarjetaPuntos) => Promise<void>;

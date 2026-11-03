import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

export interface TipoCaja extends Entidad {
    id: string;
    descripcion: string;
    sku: string | null;
    capacidad: number | null;
    prefijo: string | null;
}

/**
 * Tipo para crear nuevo tipo de caja (el id lo proporciona el cliente)
 */
export interface NuevoTipoCaja extends Modelo {
    descripcion: string;
    sku: string | null;
    capacidad: number | null;
    prefijo: string | null;
}

/**
 * Tipo para actualizar campos de un tipo de caja existente.
 * descripcion: se guarda por auto-guardado del detalle.
 * sku/capacidad: se cambian desde el modal CambiarSkuTipoCaja.
 */
export type CambiosTipoCaja = {
    descripcion?: string;
    sku?: string | null;
    capacidad?: number | null;
    prefijo?: string | null;
};

/**
 * Tipos de funciones para infraestructura (contratos)
 */
export type GetTipoCaja = (id: string) => Promise<TipoCaja>;

export type GetTiposCaja = (criteria: Criteria) => RespuestaLista<TipoCaja>;

export type PostTipoCaja = (nuevo: NuevoTipoCaja) => Promise<string>;

export type PatchTipoCaja = (id: string, cambios: CambiosTipoCaja) => Promise<void>;

export type DeleteTipoCaja = (id: string) => Promise<void>;

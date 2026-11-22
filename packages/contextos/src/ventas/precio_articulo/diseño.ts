import { Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

/**
 * Condición de precio de un cliente para un artículo (tabla
 * `preciosarticulos`), por tramo de cantidad. La aplica el servidor cuando la
 * secuencia del plugin `precio_articulo` incluye la fuente `precios_articulos`.
 *
 * - Con `dtoPorcentual` distinto de 0 se aplica ese descuento sobre el precio
 *   de tarifa o de la ficha del artículo, y `pvp` se ignora.
 * - Sin descuento, `pvp` es el precio neto.
 * - `cantidadMin`/`cantidadMax` a 0 significan "sin límite" por ese lado.
 */
export interface PrecioArticulo extends Entidad {
    id: string;
    clienteId: string;
    articuloId: string;
    descripcionArticulo: string;
    cantidadMin: number;
    cantidadMax: number;
    dtoPorcentual: number;
    pvp: number;
}

/**
 * Alta. `descripcionArticulo` no viaja a la API: alimenta el autocompletar.
 */
export interface NuevoPrecioArticulo extends Modelo {
    articuloId: string;
    descripcionArticulo: string;
    cantidadMin: number;
    cantidadMax: number;
    dtoPorcentual: number;
    pvp: number;
}

export type CambiosPrecioArticulo = Partial<PrecioArticulo>;

export type GetPreciosArticuloCliente = (clienteId: string) => RespuestaLista<PrecioArticulo>;
export type PostPrecioArticulo = (clienteId: string, nuevo: NuevoPrecioArticulo) => Promise<string>;
export type PatchPrecioArticulo = (id: string, cambios: CambiosPrecioArticulo) => Promise<void>;
export type DeletePrecioArticulo = (id: string) => Promise<void>;

import { Criteria, Entidad, RespuestaLista } from "@olula/lib/diseño.ts";

/** Estado del lote de producción (`lotes.estado`): `PTE` si le queda algo por recibir. */
export type EstadoLote = "PTE" | "TERMINADO";

/**
 * Ficha de producción del lote (columnas de produccion4 en `lotes`). Solo llega con el plugin
 * `produccion` activo. Las cantidades las mantienen las colas de almacén y «Revisar lote».
 */
export interface ProduccionLote {
    estado: string;
    cantidadProgramada: number;
    cantidadLote: number;
    cantidadTotal: number;
    cantidadUsada: number;
    cantidadReservada: number;
    cantidadPorRecibir: number;
    cantidadDisponible: number;
    /** Orden de producción que lo fabrica; vacía si no es un lote producido. */
    ordenId: string;
    /** "AAAA-MM-DD" o vacía. */
    fechaFabricacion: string;
    clienteId: string;
    cliente: string;
}

/** Lote (`lotes`). Fechas "AAAA-MM-DD" o vacías. */
export interface Lote extends Entidad {
    id: string;
    /** Referencia del artículo. */
    sku: string;
    articulo: string;
    caducidad: string;
    /** `enalmacen`: lo que tiene en todos los almacenes (movimientos hechos). */
    enAlmacen: number;
    /** `null` sin el plugin `produccion`. */
    produccion: ProduccionLote | null;
}

export type GetLote = (id: string) => Promise<Lote>;
export type GetLotes = (criteria: Criteria) => RespuestaLista<Lote>;
/** «Revisar lote»: recalcula sus cantidades con sus movimientos; devuelve cuántos lotes ha revisado. */
export type RevisarLote = (id: string) => Promise<number>;
export type RevisarLotes = () => Promise<number>;

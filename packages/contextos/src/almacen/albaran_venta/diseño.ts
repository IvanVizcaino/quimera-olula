export type PostCrearMovimientoLote = (
    albaranId: string,
    lineaId: string,
    payload: { lote_id: string; cantidad: number; fechahora?: string }
) => Promise<void>;

export type PostBorrarMovimientoLote = (
    albaranId: string,
    lineaId: string,
    payload: { movimiento_id: string }
) => Promise<void>;

/** CC-04: devuelve el codlote del último lote comprado (FP/AP) para la referencia dada.
 *  Devuelve null si el plugin trazabilidad está inactivo o no hay lotes de entrada. */
export type GetLoteSugerido = (referencia: string) => Promise<string | null>;
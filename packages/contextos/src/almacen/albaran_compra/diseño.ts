export type PostCrearMovimientoLoteCompra = (
    documentoId: string,
    lineaId: string,
    payload: { lote_id: string; cantidad: number; fechahora?: string }
) => Promise<void>;

export type PostBorrarMovimientoLoteCompra = (
    documentoId: string,
    lineaId: string,
    payload: { movimiento_id: string }
) => Promise<void>;

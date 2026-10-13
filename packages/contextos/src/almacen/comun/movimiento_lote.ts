export interface MovimientoLoteApi {
    id: string;
    lote_id: string;
    cantidad: number;
}

export interface MovimientoLoteDominio {
    id: string;
    loteId: string;
    cantidad: number;
}

export const movimientoLoteDesdeApi = (m: MovimientoLoteApi): MovimientoLoteDominio => ({
    id: m.id,
    loteId: m.lote_id,
    cantidad: m.cantidad,
});

export const camposLoteLineaDesdeApi = (api: {
    por_lotes?: boolean;
    movimientos?: MovimientoLoteApi[];
}) => ({
    porLotes: api.por_lotes ?? false,
    movimientos: (api.movimientos ?? []).map(movimientoLoteDesdeApi),
});

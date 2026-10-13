import { ReciboCompra } from "../diseño.js";

export type EstadoDetalleReciboCompra =
    | 'INICIAL'
    | 'ABIERTO' | 'VIENDO_TRAZA'
    | 'ORDENANDO_PAGO'
    | 'PAGANDO'
    | 'DEVOLVIENDO'
    | 'ANULANDO_PAGO';

export type ContextoDetalleReciboCompra = {
    estado: EstadoDetalleReciboCompra;
    recibo: ReciboCompra;
};

import { RemesaPago } from "../diseño.js";

export type EstadoDetalleRemesaPago =
    | 'INICIAL'
    | 'ABIERTO'
    | 'PAGANDO'
    | 'DESHACIENDO_PAGO';

export type ContextoDetalleRemesaPago = {
    estado: EstadoDetalleRemesaPago;
    remesa: RemesaPago;
};

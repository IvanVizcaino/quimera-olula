import { RemesaPago } from "../diseño.js";

export type EstadoDetalleRemesaPago =
    | 'INICIAL'
    | 'ABIERTO'
    | 'PAGANDO'
    | 'DESHACIENDO_PAGO'
    | 'ASOCIANDO_RECIBOS'
    | 'EXCLUYENDO_RECIBO';

export type ContextoDetalleRemesaPago = {
    estado: EstadoDetalleRemesaPago;
    remesa: RemesaPago;
    reciboExcluirId: string | null;
};

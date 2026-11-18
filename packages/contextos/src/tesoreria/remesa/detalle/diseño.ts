import { Remesa } from "../diseño.js";

export type EstadoDetalleRemesa =
    | 'INICIAL'
    | 'ABIERTO'
    | 'PAGANDO'
    | 'DESHACIENDO_PAGO'
    | 'GENERANDO_FICHERO';

export type ContextoDetalleRemesa = {
    estado: EstadoDetalleRemesa;
    remesa: Remesa;
};

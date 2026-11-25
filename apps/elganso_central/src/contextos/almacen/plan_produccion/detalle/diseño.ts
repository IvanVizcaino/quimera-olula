import { CabeceraPlanProduccion, LineaPlanProduccion } from "../diseño.ts";

export type EstadoDetallePlanProduccion =
    | 'INICIAL'
    | 'ABIERTO'
    | 'BORRANDO'
    | 'PEGANDO_EXCEL';

/**
 * `lineas` son las del servidor; `rejilla` es la copia en memoria que edita el
 * usuario hasta que pulsa "Guardar rejilla".
 */
export type ContextoDetallePlanProduccion = {
    estado: EstadoDetallePlanProduccion;
    cabecera: CabeceraPlanProduccion;
    lineas: LineaPlanProduccion[];
    rejilla: LineaPlanProduccion[];
};

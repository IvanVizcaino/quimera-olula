import { EstadoPatrimonioNeto, PatrimonioNeto } from "../diseño.ts";

export type EstadoDetallePatrimonioNeto = "INICIAL" | "ABIERTO" | "BORRANDO";

export type ContextoDetallePatrimonioNeto = {
    estado: EstadoDetallePatrimonioNeto;
    informe: PatrimonioNeto;
    /** `null` mientras no se ha calculado o tras cambiar los criterios. */
    datos: EstadoPatrimonioNeto | null;
};

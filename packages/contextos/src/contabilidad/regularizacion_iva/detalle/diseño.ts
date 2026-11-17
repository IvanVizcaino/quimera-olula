import { RegularizacionIva } from "../diseño.ts";

export type EstadoDetalleRegularizacionIva = "INICIAL" | "ABIERTO" | "BORRANDO";

export type ContextoDetalleRegularizacionIva = {
    estado: EstadoDetalleRegularizacionIva;
    regularizacion: RegularizacionIva;
};

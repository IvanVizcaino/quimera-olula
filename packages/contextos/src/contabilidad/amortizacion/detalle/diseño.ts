import { Amortizacion } from "../diseño.ts";

export type EstadoDetalleAmortizacion = "INICIAL" | "ABIERTO" | "BORRANDO";

export type ContextoDetalleAmortizacion = {
    estado: EstadoDetalleAmortizacion;
    amortizacion: Amortizacion;
};

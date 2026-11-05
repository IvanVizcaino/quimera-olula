import { BalanceCuentasAnuales, CuentasAnuales } from "../diseño.ts";

export type EstadoDetalleCuentasAnuales = "INICIAL" | "ABIERTO" | "BORRANDO";

export type ContextoDetalleCuentasAnuales = {
    estado: EstadoDetalleCuentasAnuales;
    informe: CuentasAnuales;
    /** `null` mientras no se ha calculado o tras cambiar los criterios. */
    balance: BalanceCuentasAnuales | null;
};

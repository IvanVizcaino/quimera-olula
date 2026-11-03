import { Cuenta } from "../diseño.ts";

export type EstadoDetalleCuenta = 'INICIAL' | 'ABIERTO' | 'BORRANDO';

export type ContextoDetalleCuenta = {
    estado: EstadoDetalleCuenta;
    cuenta: Cuenta;
};

import { CuentaEspecial } from "../diseño.ts";

export type EstadoDetalleCuentaEspecial = 'INICIAL' | 'ABIERTO' | 'BORRANDO';

export type ContextoDetalleCuentaEspecial = {
    estado: EstadoDetalleCuentaEspecial;
    cuentaEspecial: CuentaEspecial;
};

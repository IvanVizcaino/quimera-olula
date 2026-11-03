import { Subcuenta } from "../diseño.ts";

export type EstadoDetalleSubcuenta = 'INICIAL' | 'ABIERTO' | 'BORRANDO';

export type ContextoDetalleSubcuenta = {
    estado: EstadoDetalleSubcuenta;
    subcuenta: Subcuenta;
};

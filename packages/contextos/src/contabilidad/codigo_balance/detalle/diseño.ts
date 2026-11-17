import { CodigoBalance } from "../diseño.ts";

export type EstadoDetalleCodigoBalance = "INICIAL" | "ABIERTO" | "BORRANDO";

export type ContextoDetalleCodigoBalance = {
    estado: EstadoDetalleCodigoBalance;
    codigoBalance: CodigoBalance;
};

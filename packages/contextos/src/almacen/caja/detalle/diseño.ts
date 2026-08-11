import { CajaContenido } from "../diseño.ts";

export type EstadoCaja = "INICIAL" | "ABIERTO" | "BORRANDO";

export type ContextoCaja = {
    estado: EstadoCaja;
    caja: CajaContenido;
};

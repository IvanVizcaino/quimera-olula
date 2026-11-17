import { Pais } from "../diseño.ts";

export type EstadoDetallePais = "INICIAL" | "ABIERTO" | "BORRANDO";

export type ContextoDetallePais = {
    estado: EstadoDetallePais;
    pais: Pais;
};

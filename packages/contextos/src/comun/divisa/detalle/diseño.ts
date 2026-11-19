import { Divisa } from "../diseño.ts";

export type EstadoDetalleDivisa = "INICIAL" | "ABIERTO" | "BORRANDO";

export type ContextoDetalleDivisa = {
    estado: EstadoDetalleDivisa;
    divisa: Divisa;
};

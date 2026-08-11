import { Comunicacion } from "../diseño.ts";

export type EstadoDetalleComunicacion = "INICIAL" | "ABIERTO";

export type ContextoDetalleComunicacion = {
    estado: EstadoDetalleComunicacion;
    comunicacion: Comunicacion;
    comunicacionInicial: Comunicacion;
};
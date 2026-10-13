import { PuntoVentaTpv } from "../diseño.ts";

export type EstadoPuntoVentaTpv = "INICIAL" | "Editando" | "Borrando";

export type ContextoPuntoVentaTpv = {
    estado: EstadoPuntoVentaTpv;
    punto: PuntoVentaTpv;
    puntoInicial: PuntoVentaTpv;
};

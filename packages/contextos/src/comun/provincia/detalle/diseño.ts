import { Provincia } from "../diseño.ts";

export type EstadoDetalleProvincia = "INICIAL" | "ABIERTO" | "BORRANDO";

export type ContextoDetalleProvincia = {
    estado: EstadoDetalleProvincia;
    provincia: Provincia;
};

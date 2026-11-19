import { ZonaGeografica } from "../diseño.ts";

export type EstadoDetalleZonaGeografica = "INICIAL" | "ABIERTO" | "BORRANDO";

export type ContextoDetalleZonaGeografica = {
    estado: EstadoDetalleZonaGeografica;
    zonaGeografica: ZonaGeografica;
};

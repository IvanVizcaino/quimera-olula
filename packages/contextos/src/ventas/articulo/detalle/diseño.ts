import { Articulo } from "../diseño.ts";

export type EstadoDetalleArticulo = "INICIAL" | "ABIERTO";

export type ContextoDetalleArticulo = {
    estado: EstadoDetalleArticulo;
    articulo: Articulo;
};

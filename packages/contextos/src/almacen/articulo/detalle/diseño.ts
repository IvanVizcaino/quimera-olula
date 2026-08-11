import { Articulo } from "../diseño.ts";

export type EstadoArticulo =
    | "INICIAL"
    | "ABIERTO"
    | "BORRANDO_ARTICULO";

export type ContextoArticulo = {
    estado: EstadoArticulo;
    articulo: Articulo;
    articuloInicial: Articulo;
};

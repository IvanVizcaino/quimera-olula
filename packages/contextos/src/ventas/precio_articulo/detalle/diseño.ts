import { ListaEntidades } from "@olula/lib/ListaEntidades.js";
import { PrecioArticulo } from "../diseño.ts";

export type EstadoPreciosArticulo =
    | "INICIAL"
    | "ABIERTO"
    | "CREANDO"
    | "CAMBIANDO"
    | "BORRANDO";

export type ContextoPreciosArticulo = {
    estado: EstadoPreciosArticulo;
    clienteId: string;
    precios: ListaEntidades<PrecioArticulo>;
};

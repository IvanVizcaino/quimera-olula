import { Stock } from "../diseño.ts";

export type EstadoDetalleStock = "INICIAL" | "ABIERTO";

export type ContextoDetalleStock = {
    estado: EstadoDetalleStock;
    stock: Stock;
};

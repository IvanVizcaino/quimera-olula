import { RegularizacionStock, Stock } from "../diseño.ts";

export type EstadoDetalleStock =
    | "INICIAL"
    | "ABIERTO"
    | "REGULARIZANDO"
    | "BORRANDO_REGULARIZACION";

export type ContextoDetalleStock = {
    estado: EstadoDetalleStock;
    stock: Stock;
    regularizaciones: RegularizacionStock[];
    regularizacionActiva: RegularizacionStock | null;
};

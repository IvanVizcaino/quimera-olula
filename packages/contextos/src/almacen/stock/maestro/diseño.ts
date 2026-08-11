import { MetaTabla } from "@olula/componentes/index.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Stock } from "../diseño.ts";

export type EstadoMaestroStock = "INICIAL";

export type ContextoMaestroStock = {
    estado: EstadoMaestroStock;
    stocks: ListaActivaEntidades<Stock>;
};

export const metaTablaStock: MetaTabla<Stock> = [
    { id: "articulo", cabecera: "Artículo" },
    { id: "almacen", cabecera: "Almacén" },
    { id: "cantidadFisica", cabecera: "Cantidad física", tipo: "numero" },
    { id: "cantidadDisponible", cabecera: "Disponible", tipo: "numero" },
];

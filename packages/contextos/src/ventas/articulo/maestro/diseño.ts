import { MetaTabla } from "@olula/componentes/index.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Articulo } from "../diseño.ts";

export type EstadoMaestroArticulo = "INICIAL";

export type ContextoMaestroArticulo = {
    estado: EstadoMaestroArticulo;
    articulos: ListaActivaEntidades<Articulo>;
};

export const metaTablaArticulo: MetaTabla<Articulo> = [
    { id: "id", cabecera: "Referencia" },
    { id: "descripcion", cabecera: "Descripción" },
    { id: "precio", cabecera: "Precio", tipo: "moneda" },
    { id: "grupo_iva_producto_id", cabecera: "Grupo IVA" },
];

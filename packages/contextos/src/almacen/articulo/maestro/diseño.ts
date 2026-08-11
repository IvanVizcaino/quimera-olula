import { MetaTabla } from "@olula/componentes/index.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Articulo } from "../diseño.ts";

export type EstadoMaestroArticulo = "INICIAL" | "CREANDO_ARTICULO";

export type ContextoMaestroArticulo = {
    estado: EstadoMaestroArticulo;
    articulos: ListaActivaEntidades<Articulo>;
};

export const metaTablaArticulo: MetaTabla<Articulo> = [
    { id: "id", cabecera: "ID" },
    { id: "descripcion", cabecera: "Descripción" },
];

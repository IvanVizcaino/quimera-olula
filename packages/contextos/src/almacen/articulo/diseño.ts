import { Entidad, Filtro, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";

export interface ArticuloAlmacen extends Entidad {
    id: string;
    descripcion: string;
};

export interface Articulo extends Entidad {
    id: string;
    descripcion: string;
};

export interface ArticuloAPI extends Entidad {
    id: string;
    descripcion: string;
};



export type GetArticulo = (id: string) => Promise<Articulo>;
export type GetArticulos = (
    filtro: Filtro,
    orden: Orden,
    paginacion?: Paginacion
) => RespuestaLista<Articulo>;
export type LeerCodBarras = (codigo: string) => Promise<ArticuloAlmacen>;

export type PostArticulo = (Articulo: Partial<Articulo>) => Promise<string>;
export type PatchArticulo = (id: string, Articulo: Partial<Articulo>) => Promise<void>;
export type DeleteArticulo = (id: string) => Promise<void>;

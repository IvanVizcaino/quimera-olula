import { Entidad } from "@olula/lib/diseño.ts";

export interface Articulo extends Entidad {
    id: string;
    descripcion: string;
    precio: number;
    grupo_iva_producto_id: string;
}

export interface TagArticulo extends Entidad {
    id: string;
    descripcion: string;
    precio: number;
    grupo_iva_producto_id: string;
}

import { Criteria, Entidad, Filtro, Orden, RespuestaLista } from "@olula/lib/diseño.ts";

export interface Articulo extends Entidad {
    id: string;
    descripcion: string;
    observaciones: string;
    familiaId: string;
    descripcionFamilia: string;
    grupoIvaProductoId: string;
    noStock: boolean;
    seCompra: boolean;
    /** Listado: columna «Uso» (CC-02 Crema); la API compras puede no enviarlo aún. */
    seVende: boolean;
    descripcionSubfamilia?: string | null;
    /** Plugin `disponible_art`: `articulos.totaldisponible` (si la API compras lo envía). */
    totalDisponible?: number | null;
}

/**
 * Pendiente del endpoint de precios por proveedor (siguiente entrega).
 */
export interface PrecioProveedorArticulo extends Entidad {
    id: string;
    proveedorId: string;
    proveedorNombre: string;
    referenciaProveedor: string;
    coste: number;
    descuento: number;
    plazoEntrega: number;
    unidadesEmbalaje: number;
    porDefecto: boolean;
}

export type CambiosArticulo = Partial<
    Pick<Articulo, "descripcion" | "observaciones" | "familiaId" | "grupoIvaProductoId">
>;

export interface TagArticulo extends Entidad {
    id: string;
    descripcion: string;
    grupoIvaProductoId: string;
}

export type GetTagsArticulo = (filtro: Filtro, orden: Orden) => Promise<TagArticulo[]>;

export type PostArticulo = (articulo: Partial<Articulo>) => Promise<string>;

export type GetArticulo = (id: string) => Promise<Articulo>;

export type GetArticulos = (criteria: Criteria) => RespuestaLista<Articulo>;

export type PatchArticulo = (id: string, cambios: CambiosArticulo) => Promise<void>;

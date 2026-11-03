import { TipoCodBarras } from "#/valores/codbarras.ts";
import { Entidad, Filtro, Modelo, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";

export interface ArticuloAlmacen extends Entidad {
    id: string;
    descripcion: string;
};

export interface ArticuloItem extends Entidad {
    id: string;
    descripcion: string;
    observaciones: string;
    codbarras: string;
    tipoCodBarras: TipoCodBarras | "";
    familiaId: string;
    descripcionFamilia: string;
    noStock: boolean;
    seCompra: boolean;
    seVende: boolean;
};

export interface CajaProveedorArticulo extends Entidad {
    id: string
    idTipoCaja: string
    tipoCaja: string
    cantidad: number
    esDefecto: boolean
}

export interface ProveedorArticulo extends Entidad {
    id: string
    idProveedor: string
    proveedor: string
    embalajes: CajaProveedorArticulo[]
}

export interface NuevaCajaProveedor extends Modelo {
    descripcion: string;
    cantidad: number;
}

export type CambiosCajaProveedor = Partial<NuevaCajaProveedor>;

export type PostCajaProveedor = (articuloId: string, proveedorId: string, nueva: NuevaCajaProveedor) => Promise<void>;
export type DeleteCajaProveedor = (articuloId: string, proveedorId: string, cajaId: string) => Promise<void>;
export type PatchCajaProveedor = (articuloId: string, proveedorId: string, cajaId: string, cambios: CambiosCajaProveedor) => Promise<void>;
export type PatchCajaProveedorDefecto = (articuloId: string, proveedorId: string, cajaId: string) => Promise<void>;


export interface Articulo extends ArticuloItem {
    proveedores: ProveedorArticulo[]
};

export type CambiosArticulo = Partial<
    Pick<
        Articulo,
        | "descripcion"
        | "observaciones"
        | "codbarras"
        | "tipoCodBarras"
        | "familiaId"
        | "noStock"
        | "seCompra"
        | "seVende"
    >
>;

export interface SkuLote {
    id: string;
    descripcion: string;
    loteId: string | null;
};

export type GetArticulo = (id: string) => Promise<Articulo>;
export type GetArticulos = (
    filtro: Filtro,
    orden: Orden,
    paginacion?: Paginacion
) => RespuestaLista<ArticuloItem>;
export type LeerCodBarras = (codigo: string) => Promise<SkuLote>;

export type PostArticulo = (Articulo: Partial<Articulo>) => Promise<string>;
export type PatchArticulo = (id: string, cambios: CambiosArticulo) => Promise<void>;
export type DeleteArticulo = (id: string) => Promise<void>;

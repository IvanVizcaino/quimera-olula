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
    /** Unidad de peso o medida ("" si no tiene). Solo con el plugin pesos_medidas. */
    unidadId: string;
    noStock: boolean;
    seCompra: boolean;
    seVende: boolean;
    /** Id de la clase de almacenamiento ("" si no tiene). */
    claseAlmacenamientoId: string;
    /** Código de la clase de almacenamiento ("" si no tiene). */
    claseAlmacenamiento: string;
    /** Dimensiones de la unidad de stock, en metros. */
    largo: number | null;
    ancho: number | null;
    alto: number | null;
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
        | "unidadId"
        | "noStock"
        | "seCompra"
        | "seVende"
        | "claseAlmacenamientoId"
        | "largo"
        | "ancho"
        | "alto"
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

/** Alta de artículo: la descripción y, opcional, el impuesto (grupo de IVA de producto). */
export type NuevoArticulo = Partial<Articulo> & { grupoIvaProductoId?: string };

export type PostArticulo = (Articulo: NuevoArticulo) => Promise<string>;
export type PatchArticulo = (id: string, cambios: CambiosArticulo) => Promise<void>;
export type DeleteArticulo = (id: string) => Promise<void>;

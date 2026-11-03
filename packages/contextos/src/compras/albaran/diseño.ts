import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";
import { TipoArticuloLinea } from "../comun/diseño.ts";

export interface Albaran extends Entidad {
    id: string;
    codigo: string;
    ejercicioId: string;
    serieId: string;
    numero: string;
    fecha: Date;
    hora: string;
    numeroProveedor: string | null;
    proveedorId: string | null;
    nombreProveedor: string;
    idFiscal: string;
    almacenId: string | null;
    nombreAlmacen: string | null;
    formaPagoId: string | null;
    nombreFormaPago: string | null;
    grupoIvaNegocioId: string;
    divisaId: string;
    tasaConversion: number;
    neto: number;
    totalIva: number;
    totalRecargo: number;
    totalIrpf: number;
    total: number;
    totalDivisaEmpresa: number;
    recargoFinanciero: number;
    facturaId: string | null;
    pendienteFactura: boolean;
    observaciones: string | null;
}

export interface LineaAlbaran extends Entidad {
    id: string;
    albaranId: string;
    pedidoId: string | null;
    lineaPedidoId: string | null;
    referencia: string | null;
    descripcion: string;
    descripcionArticulo: string | null;
    cantidad: number;
    pvpUnitario: number;
    dtoPorcentual: number;
    dtoLineal: number;
    pvpSinDto: number;
    pvpTotal: number;
    grupoIvaProductoId: string;
    tipoIva: number;
    tipoRecargo: number;
    tipoIrpf: number;
}

export interface NuevoAlbaran extends Modelo {
    proveedorId: string;
    nombreProveedor: string;
    fecha: Date;
    numeroProveedor: string | null;
    almacenId: string | null;
    observaciones: string | null;
}

export interface NuevoAlbaranProveedorNoRegistrado extends Modelo {
    nombre: string;
    idFiscal: string;
    fecha: Date;
    numeroProveedor: string | null;
    almacenId: string | null;
    observaciones: string | null;
}

export interface NuevaLineaAlbaran extends Modelo {
    tipoArticulo: TipoArticuloLinea;
    referencia: string | null;
    descripcion: string;
    descripcionArticulo: string | null;
    cantidad: number;
    pvpUnitario: number | null;
    dtoPorcentual: number;
    dtoLineal: number;
    pvpTotal: number;
    grupoIvaProductoId: string | null;
    ivaIncluido: boolean;
    tipoIva: number;
    tipoRecargo: number;
    tipoIrpf: number;
}

export interface ModeloLineaAlbaran extends LineaAlbaran {
    tipoArticulo: TipoArticuloLinea;
}

export type AlbaranCreado = {
    id: string;
    codigo: string;
};

export type LineaAAlbaranar = {
    lineaPedidoId: string;
    cantidad: number;
};

export type CambiosAlbaran = Partial<Albaran>;

export type CambiosLineaAlbaran = Partial<ModeloLineaAlbaran>;

export type GetAlbaran = (id: string) => Promise<Albaran>;
export type GetAlbaranes = (criteria: Criteria) => RespuestaLista<Albaran>;
export type PostAlbaran = (
    nuevoAlbaran: NuevoAlbaran | NuevoAlbaranProveedorNoRegistrado
) => Promise<string>;
export type AlbaranarPedidos = (
    pedidoIds: string[],
    lineas?: LineaAAlbaranar[]
) => Promise<AlbaranCreado>;
export type PatchAlbaran = (id: string, cambios: CambiosAlbaran) => Promise<void>;
export type DeleteAlbaran = (id: string) => Promise<void>;
export type GetReportAlbaran = (id: string) => Promise<Blob>;

export type GetLineasAlbaran = (id: string) => Promise<LineaAlbaran[]>;
export type GetLineaAlbaran = (id: string, lineaId: string) => Promise<LineaAlbaran>;
export type PostLineasAlbaran = (
    id: string,
    lineas: NuevaLineaAlbaran[]
) => Promise<string[]>;
/**
 * Dry-run del alta de línea: el servidor calcula el coste del proveedor y los
 * impuestos sin grabar nada, para poder enseñarlos en el modal.
 */
export type QueryNuevaLineaAlbaran = (
    id: string,
    linea: NuevaLineaAlbaran
) => Promise<NuevaLineaAlbaran>;
export type PatchLineaAlbaran = (
    id: string,
    lineaId: string,
    cambios: CambiosLineaAlbaran
) => Promise<void>;
export type BorrarLineasAlbaran = (id: string, lineas: string[]) => Promise<void>;

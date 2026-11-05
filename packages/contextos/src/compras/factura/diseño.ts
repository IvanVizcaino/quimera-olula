import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";
import { TipoArticuloLinea } from "../comun/diseño.ts";

/**
 * Estado de expedición que devuelve el servidor. El borrador todavía no tiene
 * número de serie: su código es `#A/3f2b1c9d` en vez de `20260A000001`. La
 * cadena vacía es la factura todavía no cargada.
 */
export type EstadoExpedicion = '' | 'BORRADOR' | 'REGISTRADA';

export interface Factura extends Entidad {
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
    rectificativaId: string | null;
    codigoRectificativa: string | null;
    deAbono: boolean;
    automatica: boolean;
    editable: boolean;
    servicios: boolean;
    noGenerarAsiento: boolean;
    asientoId: string | null;
    observaciones: string | null;
    estadoExpedicion: EstadoExpedicion;
}

export interface LineaFactura extends Entidad {
    id: string;
    facturaId: string;
    albaranId: string | null;
    codigoAlbaran: string | null;
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

export interface NuevaFactura extends Modelo {
    proveedorId: string;
    nombreProveedor: string;
    fecha: Date;
    numeroProveedor: string | null;
    almacenId: string | null;
    observaciones: string | null;
    deAbono: boolean;
}

export interface NuevaFacturaProveedorNoRegistrado extends Modelo {
    nombre: string;
    idFiscal: string;
    fecha: Date;
    numeroProveedor: string | null;
    almacenId: string | null;
    observaciones: string | null;
    deAbono: boolean;
}

export interface NuevaLineaFactura extends Modelo {
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

export interface ModeloLineaFactura extends LineaFactura {
    tipoArticulo: TipoArticuloLinea;
}

export type FacturaCreada = {
    id: string;
    codigo: string;
};

export type CambiosFactura = Partial<Factura>;

export type CambiosLineaFactura = Partial<ModeloLineaFactura>;

export type GetFactura = (id: string) => Promise<Factura>;
export type GetFacturas = (criteria: Criteria) => RespuestaLista<Factura>;
export type PostFactura = (
    nuevaFactura: NuevaFactura | NuevaFacturaProveedorNoRegistrado
) => Promise<string>;
export type FacturarAlbaranes = (albaranIds: string[]) => Promise<FacturaCreada>;
export type PatchFactura = (id: string, cambios: CambiosFactura) => Promise<void>;
export type PatchRectificativa = (id: string, rectificativaId: string | null) => Promise<void>;
/**
 * Saca la factura de borrador y le asigna el código definitivo. La respuesta
 * solo confirma, así que hay que recargar la factura para ver el código nuevo.
 */
export type PatchRegistrarFactura = (id: string) => Promise<void>;
export type DeleteFactura = (id: string) => Promise<void>;
export type GetReportFactura = (id: string) => Promise<Blob>;

export type GetLineasFactura = (id: string) => Promise<LineaFactura[]>;
export type GetLineaFactura = (id: string, lineaId: string) => Promise<LineaFactura>;
export type PostLineasFactura = (
    id: string,
    lineas: NuevaLineaFactura[]
) => Promise<string[]>;
/**
 * Dry-run del alta de línea: el servidor calcula el coste del proveedor y los
 * impuestos sin grabar nada, para poder enseñarlos en el modal.
 */
export type QueryNuevaLineaFactura = (
    id: string,
    linea: NuevaLineaFactura
) => Promise<NuevaLineaFactura>;
export type PatchLineaFactura = (
    id: string,
    lineaId: string,
    cambios: CambiosLineaFactura
) => Promise<void>;
export type BorrarLineasFactura = (id: string, lineas: string[]) => Promise<void>;

export interface ReciboFactura extends Entidad {
    id: string;
    codigo: string;
    fecha_emision: string;
    fecha_vencimiento: string;
    estado: string;
    importe: number;
}

export type GetRecibosFactura = (facturaId: string) => Promise<ReciboFactura[]>;

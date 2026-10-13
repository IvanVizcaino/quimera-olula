import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";
import { TipoArticuloLinea } from "../comun/diseño.ts";

export type TratamientoIvaImportacion = "Total" | "Reversión";

/** Plugin `facturas_impor` (Eneboo `facturasprov.idfacturaimport`, `dua`...). */
export interface ImportacionFactura extends Modelo {
    facturaImportacionId: string | null;
    facturaDuaId: string | null;
    dua: string | null;
    fechaDua: Date | null;
    base: number;
    tipoIva: number;
    cuota: number;
    tratamiento: TratamientoIvaImportacion;
}

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
    importacion: ImportacionFactura | null;
    impreso?: boolean;
}

export interface MovimientoLote {
    id: string;
    loteId: string;
    cantidad: number;
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
    porLotes: boolean;
    movimientos: MovimientoLote[];
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
}

export interface ModeloLineaFactura extends LineaFactura {
    tipoArticulo: TipoArticuloLinea;
}

export type FacturaCreada = {
    id: string;
    codigo: string;
};

export type CambiosFactura = Partial<Factura>;

export type PatchImportacionFactura = (
    id: string,
    cambios: Partial<ImportacionFactura>
) => Promise<void>;

export type CambiosLineaFactura = Partial<ModeloLineaFactura>;

export type GetFactura = (id: string) => Promise<Factura>;
export type GetFacturas = (criteria: Criteria) => RespuestaLista<Factura>;
export type PostFactura = (
    nuevaFactura: NuevaFactura | NuevaFacturaProveedorNoRegistrado
) => Promise<string>;
export type FacturarAlbaranes = (albaranIds: string[]) => Promise<FacturaCreada>;
export type PatchFactura = (id: string, cambios: CambiosFactura) => Promise<void>;
export type PatchRectificativa = (id: string, rectificativaId: string | null) => Promise<void>;
export type DeleteFactura = (id: string) => Promise<void>;
export type GetReportFactura = (id: string) => Promise<Blob>;

export type GetLineasFactura = (id: string) => Promise<LineaFactura[]>;
export type GetLineaFactura = (id: string, lineaId: string) => Promise<LineaFactura>;
export type PostLineasFactura = (
    id: string,
    lineas: NuevaLineaFactura[]
) => Promise<string[]>;
/** Plugin `facturas_impor`: Eneboo `frasImport_crearLinea`. */
export type PostLineaIvaImportacion = (id: string) => Promise<string>;
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

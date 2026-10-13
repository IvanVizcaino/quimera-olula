import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";
import { TipoArticuloLinea } from "../comun/diseño.ts";

export type Recibido = 'No' | 'Parcial' | 'Sí';

export interface Pedido extends Entidad {
    id: string;
    codigo: string;
    ejercicioId: string;
    serieId: string;
    numero: string;
    fecha: Date;
    fechaEntrada: Date;
    numeroProveedor: string | null;
    proveedorId: string | null;
    nombreProveedor: string;
    idFiscal: string;
    almacenId: string | null;
    nombreAlmacen: string | null;
    formaPagoId: string;
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
    recibido: Recibido | null;
    observaciones: string | null;
    impreso?: boolean;
}

export interface LineaPedido extends Entidad {
    id: string;
    pedidoId: string;
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
    cantidadRecibida: number;
    cerrada: boolean;
    porLotes: boolean;
}

export interface NuevoPedido extends Modelo {
    proveedorId: string;
    nombreProveedor: string;
    fecha: Date;
    fechaEntrada: Date | null;
    numeroProveedor: string | null;
    almacenId: string | null;
    observaciones: string | null;
}

export interface NuevoPedidoProveedorNoRegistrado extends Modelo {
    nombre: string;
    idFiscal: string;
    fecha: Date;
    fechaEntrada: Date | null;
    numeroProveedor: string | null;
    almacenId: string | null;
    observaciones: string | null;
}

export interface NuevaLineaPedido extends Modelo {
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

export interface ModeloLineaPedido extends LineaPedido {
    tipoArticulo: TipoArticuloLinea;
}

export type CambiosPedido = Partial<Pedido>;

export type CambiosLineaPedido = Partial<ModeloLineaPedido>;

export type GetPedido = (id: string) => Promise<Pedido>;
export type GetPedidos = (criteria: Criteria) => RespuestaLista<Pedido>;
export type PostPedido = (
    nuevoPedido: NuevoPedido | NuevoPedidoProveedorNoRegistrado
) => Promise<string>;
export type PatchPedido = (id: string, cambios: CambiosPedido) => Promise<void>;
export type DeletePedido = (id: string) => Promise<void>;
export type GetReportPedido = (id: string) => Promise<Blob>;

export type GetLineasPedido = (id: string) => Promise<LineaPedido[]>;
export type GetLineaPedido = (id: string, lineaId: string) => Promise<LineaPedido>;
export type PostLineasPedido = (
    id: string,
    lineas: NuevaLineaPedido[]
) => Promise<string[]>;
export type QueryNuevaLineaPedido = (
    id: string,
    linea: NuevaLineaPedido
) => Promise<NuevaLineaPedido>;
export type PatchLineaPedido = (
    id: string,
    lineaId: string,
    cambios: CambiosLineaPedido
) => Promise<void>;
export type CerrarLineaPedido = (id: string, lineaId: string, cerrada: boolean) => Promise<void>;
export type BorrarLineasPedido = (id: string, lineas: string[]) => Promise<void>;

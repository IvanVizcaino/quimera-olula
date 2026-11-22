import { Criteria, Entidad, RespuestaLista } from "@olula/lib/diseño.ts";
import { MovimientoRecibo } from "../recibo_venta/diseño.ts";

export interface ReciboCompra extends Entidad {
    /** Cuenta bancaria del titular en la que se domicilia (TES-06). */
    cuentaDomiciliacionId: string | null;
    nombreCuentaDomiciliacion: string;
    id: string;
    facturaId: string | null;
    codigo: string;
    fechaEmision: Date | null;
    fechaVencimiento: Date | null;
    estado: string;
    importe: number;
    proveedorId: string | null;
    nombreProveedor: string;
    idFiscal: string;
    divisaId: string;
    /** Divisa de la empresa: si es otra, pagar o devolver pide la tasa de cambio. */
    divisaEmpresaId: string | null;
    /** Pagos y devoluciones (`pagosdevolprov`); solo los trae la ficha. */
    pagos: MovimientoRecibo[];
}

export type GetReciboCompra = (id: string) => Promise<ReciboCompra>;

export type GetRecibosCompra = (criteria: Criteria) => RespuestaLista<ReciboCompra>;

export type MovimientoReciboCompra = {
    cuentaPagoId: string;
    fecha: string;
    tasaConversion?: number;
};

export type PatchPagarReciboCompra = (id: string, pago: MovimientoReciboCompra) => Promise<void>;

export type PatchDevolverReciboCompra = (id: string, devolucion: MovimientoReciboCompra) => Promise<void>;

export type PatchAnularPagoReciboCompra = (id: string) => Promise<void>;

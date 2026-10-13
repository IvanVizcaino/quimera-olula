import { Criteria, Entidad, RespuestaLista } from "@olula/lib/diseño.ts";
import { TotalesReciboListado } from "../comun/totales_recibo.ts";

export interface MovimientoReciboCompra extends Entidad {
    id: string;
    fecha: Date | null;
    tipo: string;
    estado: boolean;
    cuentaPagoId: string;
    nombreCuentaPago: string;
}

export interface ReciboCompra extends Entidad {
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
    /** Pagos y devoluciones; el GET por id incluye el array (el listado no). */
    pagos: MovimientoReciboCompra[];
}

export type GetReciboCompra = (id: string) => Promise<ReciboCompra>;

export type GetRecibosCompra = (criteria: Criteria) => RespuestaLista<ReciboCompra>;

export type GetTotalesRecibosCompra = (criteria: Criteria) => Promise<TotalesReciboListado>;

export type PagoReciboCompra = {
    cuentaPagoId: string;
    fecha: string;
    /** mediopago340 C — proveedores RECC (criterio_caja.eneboo). */
    iban?: string | null;
    /** mediopago340 T/O — proveedores RECC. */
    numeroCheque?: string | null;
};

export type PatchPagarReciboCompra = (id: string, pago: PagoReciboCompra) => Promise<void>;

export type DevolucionReciboCompra = {
    cuentaPagoId: string;
    fecha: string;
    iban?: string | null;
    numeroCheque?: string | null;
};

export type PatchDevolverReciboCompra = (id: string, devolucion: DevolucionReciboCompra) => Promise<void>;

export type PatchAnularPagoReciboCompra = (id: string, pagoId: string) => Promise<void>;

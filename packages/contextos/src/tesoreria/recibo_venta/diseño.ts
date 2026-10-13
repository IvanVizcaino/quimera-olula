import { Criteria, Entidad, RespuestaLista } from "@olula/lib/diseño.ts";
import { TotalesReciboListado } from "../comun/totales_recibo.ts";

export interface MovimientoRecibo extends Entidad {
    id: string;
    fecha: Date | null;
    tipo: string;
    estado: boolean;
    cuentaPagoId: string;
    nombreCuentaPago: string;
}

export interface ReciboVenta extends Entidad {
    id: string;
    facturaId: string;
    grupoId: string;
    codigo: string;
    fechaEmision: Date | null;
    fechaVencimiento: Date | null;
    estado: string;
    importe: number;
    clienteId: string;
    nombreCliente: string;
    idFiscal: string;
    pagos: MovimientoRecibo[];
    recibosAgrupados: ReciboVenta[];
}

export type GetReciboVenta = (id: string) => Promise<ReciboVenta>;

export type GetRecibosVenta = (criteria: Criteria) => RespuestaLista<ReciboVenta>;

export type GetTotalesRecibosVenta = (criteria: Criteria) => Promise<TotalesReciboListado>;

export type PagoReciboVenta = {
    cuentaPagoId: string;
    fecha: string;
};

export type PatchPagarReciboVenta = (id: string, pago: PagoReciboVenta) => Promise<void>;

export type AgruparRecibosVenta = (id: string, reciboIds: string[]) => Promise<string>;

export type DesagruparReciboVenta = (id: string) => Promise<string>;

export type DevolucionReciboVenta = {
    cuentaPagoId: string;
    fecha: string;
};

export type PatchDevolverReciboVenta = (id: string, devolucion: DevolucionReciboVenta) => Promise<void>;

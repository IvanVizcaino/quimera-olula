import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

export interface MovimientoRemesaPago extends Entidad {
    id: string;
    fecha: Date | null;
    tipo: string;
}

export interface ReciboDeRemesaPago extends Entidad {
    id: string;
    codigo: string;
    fechaVencimiento: Date | null;
    estado: string;
    importe: number;
    proveedorId: string;
    nombreProveedor: string;
    pagos: MovimientoRemesaPago[];
}

export interface RemesaPago extends Entidad {
    id: string;
    fecha: Date | null;
    fechaCargo: Date | null;
    total: number;
    divisaId: string;
    cuentaId: string;
    estado: string;
    empresaId: string;
    recibos: ReciboDeRemesaPago[];
    pagos: MovimientoRemesaPago[];
}

export interface NuevaRemesaPago extends Modelo {
    cuentaId: string;
    reciboIds: string[];
}

export type GetRemesaPago = (id: string) => Promise<RemesaPago>;

export type GetRemesasPago = (criteria: Criteria) => RespuestaLista<RemesaPago>;

export type PostRemesaPago = (nueva: NuevaRemesaPago) => Promise<string>;

export type DatosPagoRemesaPago = {
    fecha: string;
    iban?: string | null;
    numeroCheque?: string | null;
};

export type PagarRemesaPago = (id: string, datos: DatosPagoRemesaPago) => Promise<void>;

export type DeshacerPagoRemesaPago = (id: string) => Promise<void>;

export type AsociarRecibosRemesaPago = (
    id: string,
    reciboIds: string[]
) => Promise<void>;

export type ExcluirReciboRemesaPago = (id: string, reciboId: string) => Promise<void>;

export type GetExportFicheroRemesaPago = (
    id: string,
    formato?: string,
) => Promise<Blob>;

import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

export interface MovimientoRemesa extends Entidad {
    id: string;
    fecha: Date | null;
    tipo: string;
}

export interface ReciboDeRemesa extends Entidad {
    id: string;
    codigo: string;
    fechaVencimiento: Date | null;
    estado: string;
    situacion: string;
    importe: number;
    clienteId: string;
    nombreCliente: string;
    pagos: MovimientoRemesa[];
}

export interface Remesa extends Entidad {
    id: string;
    fecha: Date | null;
    fechaCargo: Date | null;
    total: number;
    divisaId: string;
    cuentaId: string;
    descripcionCuenta: string;
    estado: string;
    empresaId: string;
    recibos: ReciboDeRemesa[];
    pagos: MovimientoRemesa[];
}

export interface NuevaRemesa extends Modelo {
    cuentaId: string;
    reciboIds: string[];
}

export type GetRemesa = (id: string) => Promise<Remesa>;

export type GetRemesas = (criteria: Criteria) => RespuestaLista<Remesa>;

export type PostRemesa = (nueva: NuevaRemesa) => Promise<string>;

export type PagarRemesa = (id: string, fecha: string) => Promise<void>;

export type DeshacerPagoRemesa = (id: string) => Promise<void>;

import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

/** El servidor manda el tipo tal cual está en `remesasprov.tiporemesa`. */
export type TipoRemesaPago = "Recibos" | "Nóminas";

export interface PagoRemesaPago extends Entidad {
    id: string;
    fecha: Date | null;
}

export interface ReciboDeRemesaPago extends Entidad {
    id: string;
    codigo: string;
    fechaVencimiento: Date | null;
    estado: string;
    importe: number;
    proveedorId: string | null;
    nombreProveedor: string;
}

export interface NominaDeRemesaPago extends Entidad {
    id: string;
    empleadoId: string;
    nombreEmpleado: string;
    fechaNomina: Date | null;
    estado: string;
    importe: number;
}

export interface RemesaPago extends Entidad {
    id: string;
    tipo: TipoRemesaPago;
    fecha: Date | null;
    fechaPago: Date | null;
    total: number;
    divisaId: string;
    cuentaId: string;
    descripcionCuenta: string;
    estado: string;
    empresaId: string;
    recibos: ReciboDeRemesaPago[];
    nominas: NominaDeRemesaPago[];
    pagos: PagoRemesaPago[];
}

/** Una remesa de recibos de proveedor o de nóminas: unos u otras, no ambos. */
export interface NuevaRemesaPago extends Modelo {
    cuentaId: string;
    fechaPago: Date | null;
    reciboIds: string[];
    nominaIds: string[];
}

/** Nómina emitida que aún no está en ninguna remesa. */
export interface NominaRemesable extends Entidad {
    id: string;
    descripcion: string;
    empleadoId: string;
    nombreEmpleado: string;
    fechaNomina: Date | null;
    importe: number;
}

export type GetRemesaPago = (id: string) => Promise<RemesaPago>;

export type GetRemesasPago = (criteria: Criteria) => RespuestaLista<RemesaPago>;

export type PostRemesaPago = (nueva: NuevaRemesaPago) => Promise<string>;

export type PagarRemesaPago = (id: string, fecha: string) => Promise<void>;

export type DeshacerPagoRemesaPago = (id: string) => Promise<void>;

export type GetNominasRemesables = () => Promise<NominaRemesable[]>;

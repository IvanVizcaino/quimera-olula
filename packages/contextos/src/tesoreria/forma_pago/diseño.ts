import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

/** Fila de `plazos`: días aplazados y % del total que vence a esos días. */
export interface PlazoFormaPago {
    dias: number;
    aplazado: number;
}

export interface DatosFormaPago {
    id: string;
    descripcion: string;
    generaRecibos: string;
    cuentaId: string;
    domiciliado: boolean;
    tipoPagoFacturae: string;
}

/** Eneboo `formaspago` con sus `plazos`. */
export interface FormaPago extends Entidad, DatosFormaPago {
    id: string;
    descripcionCuenta: string;
    plazos: PlazoFormaPago[];
}

export type NuevaFormaPago = DatosFormaPago & Modelo;

export type CambiosFormaPago = Partial<Omit<DatosFormaPago, "id">> & { plazos?: PlazoFormaPago[] };

export type GetFormasPago = (criteria: Criteria) => RespuestaLista<FormaPago>;
export type GetFormaPago = (id: string) => Promise<FormaPago>;
export type PostFormaPago = (nueva: NuevaFormaPago) => Promise<string>;
export type PatchFormaPago = (id: string, cambios: CambiosFormaPago) => Promise<void>;
export type DeleteFormaPago = (id: string) => Promise<void>;

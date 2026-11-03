import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

/** Eneboo `co_cuentasesp`: tipos de cuenta con un papel fijo en la
 * contabilidad (IVASOP, IVAREP, CLIENT, VENTAS...). El id es el código. */
export interface CuentaEspecial extends Entidad {
    id: string;
    descripcion: string;
    codigoCuenta: string;
    codigoSubcuenta: string;
}

export type GetCuentasEspeciales = (
    criteria: Criteria
) => RespuestaLista<CuentaEspecial>;
export type GetCuentaEspecial = (id: string) => Promise<CuentaEspecial>;

export interface NuevaCuentaEspecial extends Modelo {
    id: string;
    descripcion: string;
    codigoCuenta: string;
    codigoSubcuenta: string;
}

export type PostCuentaEspecial = (
    nuevo: NuevaCuentaEspecial
) => Promise<string>;

export type CambiosCuentaEspecial = Partial<
    Pick<CuentaEspecial, "descripcion" | "codigoCuenta" | "codigoSubcuenta">
>;

export type PatchCuentaEspecial = (
    id: string,
    cambios: CambiosCuentaEspecial
) => Promise<void>;

export type DeleteCuentaEspecial = (id: string) => Promise<void>;

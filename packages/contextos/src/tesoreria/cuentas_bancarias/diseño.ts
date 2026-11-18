import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

export interface CuentaBancaria extends Entidad {
    id: string;
    codigoCuenta: string;
    paisId: string;
    obsoleta: boolean;
    empresaId: string;
    descripcion: string;
    iban: string;
    bic: string;
    entidad: string;
    agencia: string;
    digitoControl: string;
    cuenta: string;
}

export interface NuevaCuentaBancaria extends Modelo {
    descripcion: string;
    iban: string;
}

export type CambiosCuentaBancaria = Partial<CuentaBancaria>;

export type GetCuentaBancaria = (id: string) => Promise<CuentaBancaria>;

export type GetCuentasBancarias = (criteria: Criteria) => RespuestaLista<CuentaBancaria>;

export type PostCuentaBancaria = (nueva: NuevaCuentaBancaria) => Promise<string>;

export type PatchCuentaBancaria = (id: string, cambios: CambiosCuentaBancaria) => Promise<void>;

export type DeleteCuentaBancaria = (id: string) => Promise<void>;

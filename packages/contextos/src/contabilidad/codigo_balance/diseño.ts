import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

/** Naturaleza en el modelo de cuentas anuales: Activo, Pasivo (patrimonio
 * neto y pasivo), Pérdidas y ganancias e Ingresos y gastos reconocidos. */
export type NaturalezaCodigoBalance = "A" | "P" | "PG" | "IG";

/** Eneboo `co_codbalances08`: línea del modelo de cuentas anuales del PGC
 * 2008. El id es el propio código (p. ej. `A-A--I-1`). */
export interface DatosCodigoBalance {
    id: string;
    naturaleza: string;
    nivel1: string;
    descripcion1: string;
    nivel2: string;
    descripcion2: string;
    nivel3: string;
    orden3: string;
    descripcion3: string;
    nivel4: string;
    descripcion4: string;
    descripcion4ba: string;
}

export interface CodigoBalance extends Entidad, DatosCodigoBalance {
    id: string;
}

export type NuevoCodigoBalance = Omit<DatosCodigoBalance, "orden3"> & Modelo;

export type CambiosCodigoBalance = Partial<Omit<DatosCodigoBalance, "id" | "orden3">>;

/** Balance normal (`co_cuentascb`) o abreviado (`co_cuentascbba`). */
export type FormatoBalance = "normal" | "abreviado";

export type SignoCuentaBalance = "Ambos" | "Positivo" | "Negativo";

/** Qué regenera cada botón del maestro de Eneboo. */
export type AlcanceRegeneracion = "todo" | "cuentas" | "cuentas_abreviado";

/** Cuentas cuyo código EMPIEZA por `codigoCuenta` suman en el código de
 * balance (es un prefijo, no una cuenta concreta del ejercicio). */
export interface CuentaCodigoBalance extends Entidad {
    id: string;
    formato: FormatoBalance;
    codigoBalanceId: string;
    codigoCuenta: string;
    descripcionCuenta: string;
    signo: string;
}

export interface NuevaCuentaCodigoBalance extends Modelo {
    codigoCuenta: string;
    descripcionCuenta: string;
    signo: string;
}

export type GetCodigosBalance = (criteria: Criteria) => RespuestaLista<CodigoBalance>;
export type GetCodigoBalance = (id: string) => Promise<CodigoBalance>;
export type PostCodigoBalance = (nuevo: NuevoCodigoBalance) => Promise<string>;
export type PatchCodigoBalance = (id: string, cambios: CambiosCodigoBalance) => Promise<void>;
export type DeleteCodigoBalance = (id: string) => Promise<void>;
export type PostRegenerarCodigosBalance = (alcance: AlcanceRegeneracion) => Promise<void>;

export type GetCuentasCodigoBalance = (
    formato: FormatoBalance,
    codigoBalanceId: string
) => RespuestaLista<CuentaCodigoBalance>;
export type PostCuentaCodigoBalance = (
    formato: FormatoBalance,
    codigoBalanceId: string,
    nueva: NuevaCuentaCodigoBalance
) => Promise<string>;
export type PatchCuentaCodigoBalance = (
    formato: FormatoBalance,
    id: string,
    cambios: Partial<NuevaCuentaCodigoBalance>
) => Promise<void>;
export type DeleteCuentaCodigoBalance = (
    formato: FormatoBalance,
    id: string
) => Promise<void>;

import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

export interface Subcuenta extends Entidad {
    id: string;
    codigo: string;
    nombre: string;
    ejercicioId: string;
    cuentaId: number;
    codigoCuenta: string;
    impuestoId: string;
    iva: number;
    recargo: number;
    /** Tipo especial de su cuenta (`co_cuentas.idcuentaesp`): IVASOP, CLIENT… */
    cuentaEspecialId: string;
    /** La subcuenta es de IVA: su cuenta es IVASOP o IVAREP. */
    esIva: boolean;
}

export type GetSubcuentas = (criteria: Criteria) => RespuestaLista<Subcuenta>;
export type GetSubcuenta = (id: string) => Promise<Subcuenta>;

export interface NuevaSubcuenta extends Modelo {
    codigo: string;
    nombre: string;
    codigoCuenta: string;
    ejercicioId: string;
    impuestoId: string;
}

export type PostSubcuenta = (nuevo: NuevaSubcuenta) => Promise<string>;

export type CambiosSubcuenta = Partial<Pick<Subcuenta, "nombre" | "impuestoId">>;

export type PatchSubcuenta = (id: string, cambios: CambiosSubcuenta) => Promise<void>;

export type DeleteSubcuenta = (id: string) => Promise<void>;

export interface SubcuentaSaldoCorregida {
    id: number;
    codigo: string;
    ejercicioId: string;
    debeAntes: number;
    haberAntes: number;
    debe: number;
    haber: number;
    saldo: number;
}

export interface ResultadoRecalculoSaldos {
    ejercicios: string[];
    revisadas: number;
    corregidas: SubcuentaSaldoCorregida[];
}

export type PatchRecalcularSaldosSubcuentas = (
    ejercicioId?: string
) => Promise<ResultadoRecalculoSaldos>;

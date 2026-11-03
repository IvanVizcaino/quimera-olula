import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

export interface Cuenta extends Entidad {
    id: string;
    codigo: string;
    nombre: string;
    ejercicioId: string;
    codigoEpigrafe: string | null;
    nivel: number;
    /** Tipo especial de la cuenta (`co_cuentas.idcuentaesp`): IVASOP, CLIENT… */
    cuentaEspecialId: string;
    /** El tipo especial la convierte en cuenta de IVA (IVASOP o IVAREP). */
    esIva: boolean;
}

export type GetCuentas = (criteria: Criteria) => RespuestaLista<Cuenta>;
export type GetCuenta = (id: string) => Promise<Cuenta>;

export interface NuevaCuenta extends Modelo {
    codigo: string;
    nombre: string;
    codigoEpigrafe: string;
    ejercicioId: string;
}

export type PostCuenta = (nuevo: NuevaCuenta) => Promise<string>;

export type CambiosCuenta = Partial<Pick<Cuenta, "nombre">>;

export type PatchCuenta = (id: string, cambios: CambiosCuenta) => Promise<void>;

export type DeleteCuenta = (id: string) => Promise<void>;

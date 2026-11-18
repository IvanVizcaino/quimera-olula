import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

/** Papel de cada subcuenta del grupo (Eneboo `co_gruposcontablesamo`). */
export type RolSubcuentaGrupo = "elemento" | "amortizacion" | "gasto" | "perdidas" | "ganancias";

export interface DatosGrupoContableAmortizacion {
    id: string;
    descripcion: string;
    subcuentaElemento: string;
    subcuentaAmortizacion: string;
    subcuentaGasto: string;
    subcuentaPerdidas: string;
    subcuentaGanancias: string;
}

export interface GrupoContableAmortizacion extends Entidad, DatosGrupoContableAmortizacion {
    id: string;
    /** Nombre de cada subcuenta en el ejercicio con que se guardó (solo lectura). */
    descripcionesSubcuentas: Record<RolSubcuentaGrupo, string>;
}

export type NuevoGrupoContableAmortizacion = DatosGrupoContableAmortizacion & Modelo;

export type CambiosGrupoContableAmortizacion = Partial<Omit<DatosGrupoContableAmortizacion, "id">>;

export type GetGruposContablesAmortizacion = (criteria: Criteria) => RespuestaLista<GrupoContableAmortizacion>;
export type GetGrupoContableAmortizacion = (id: string) => Promise<GrupoContableAmortizacion>;
export type PostGrupoContableAmortizacion = (
    nuevo: NuevoGrupoContableAmortizacion,
    ejercicioId: string
) => Promise<string>;
export type PatchGrupoContableAmortizacion = (
    id: string,
    cambios: CambiosGrupoContableAmortizacion,
    ejercicioId: string
) => Promise<void>;
export type DeleteGrupoContableAmortizacion = (id: string) => Promise<void>;

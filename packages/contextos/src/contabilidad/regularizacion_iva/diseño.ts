import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

/** Eneboo `co_regiva`: periodo de I.V.A. declarado y su asiento de
 * regularización (472/477 contra 4700/4750). Las partidas de I.V.A. del
 * periodo quedan bloqueadas mientras exista. */
export interface RegularizacionIva extends Entidad {
    id: string;
    ejercicioId: string;
    periodo: string;
    fechaInicio: Date;
    fechaFin: Date;
    fechaAsiento: Date;
    asientoId: string;
    numeroAsiento: number | null;
    importe: number | null;
    codigoSubcuentaDeudora: string;
    codigoSubcuentaAcreedora: string;
}

export type Trimestre = "T1" | "T2" | "T3" | "T4" | "OTRO";

export interface NuevaRegularizacionIva extends Modelo {
    ejercicioId: string;
    trimestre: Trimestre;
    fechaInicio: Date;
    fechaFin: Date;
    fechaAsiento: Date | null;
    codigoSubcuentaDeudora: string;
    codigoSubcuentaAcreedora: string;
}

export interface SubcuentasRegularizacionIva {
    codigoSubcuentaDeudora: string;
    codigoSubcuentaAcreedora: string;
}

export interface PeriodoRegularizacion {
    fechaInicio: Date;
    fechaFin: Date;
    fechaAsiento: Date;
}

export type GetRegularizacionesIva = (
    criteria: Criteria
) => RespuestaLista<RegularizacionIva>;
export type GetRegularizacionIva = (id: string) => Promise<RegularizacionIva>;
export type PostRegularizacionIva = (
    nueva: NuevaRegularizacionIva
) => Promise<string>;
export type DeleteRegularizacionIva = (id: string) => Promise<void>;

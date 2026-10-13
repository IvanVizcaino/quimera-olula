import type { Criteria, Entidad, RespuestaLista } from "@olula/lib/diseño.ts";

export type Modelo303Id = number;

export interface TotalesModelo303 {
    cuotadevtotal: number;
    cuotadedtotal: number;
    cuotadif: number;
    resliquid: number;
    cuotaresultado: number;
}

export interface ItemModelo303 extends Entidad {
    id: string;
    modeloId: Modelo303Id;
    codejercicio: string;
    tipoPeriodo: string | null;
    trimestre: string | null;
    mes: string | null;
    fechaInicio: string;
    fechaFin: string;
    totales: TotalesModelo303;
    /** Desplegado en listado (copia de totales.resliquid). */
    resliquid: number;
    /** Desplegado en listado (copia de totales.cuotaresultado). */
    cuotaresultado: number;
}

export interface Modelo303Cabecera extends ItemModelo303 {
    complementaria: boolean;
    sinactividad: boolean;
}

export interface DiffModelo303 extends Entidad {
    clave: string;
    almacenado: number;
    calculado: number;
    delta: number;
}

export interface ResultadoGeneracionModelo303 {
    modeloId: Modelo303Id;
    codejercicio: string;
    fechaInicio: string;
    fechaFin: string;
    calculado: Record<string, number>;
    diffs: DiffModelo303[];
    coincide: boolean;
}

export type GetGeneracionModelo303 = (modeloId: Modelo303Id) => Promise<ResultadoGeneracionModelo303>;

export type PatchGenerarModelo303 = (modeloId: Modelo303Id) => Promise<void>;

export type GetModelos303 = (criteria: Criteria) => RespuestaLista<ItemModelo303>;
export type GetModelo303 = (modeloId: Modelo303Id) => Promise<Modelo303Cabecera>;

export type GetExportAeatModelo303 = (modeloId: Modelo303Id) => Promise<Blob>;

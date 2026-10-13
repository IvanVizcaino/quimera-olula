import type { Entidad } from "@olula/lib/diseño.ts";

export type Modelo349Id = number;

export interface DiffTotalModelo349 extends Entidad {
    clave: string;
    almacenado: number;
    calculado: number;
    delta: number;
}

export interface Operacion349 extends Entidad {
    clave: string;
    codcliente: string | null;
    codproveedor: string | null;
    codpais: string;
    codue: string;
    cifnif: string;
    nombre: string;
    baseimponible: number;
}

export interface ResultadoGeneracionModelo349 {
    modeloId: Modelo349Id;
    codejercicio: string;
    numtotaloi: number;
    importetotaloi: number;
    numtotaloirec: number;
    importetotaloirec: number;
    operaciones: Operacion349[];
    diffsTotales: DiffTotalModelo349[];
    diffsOperaciones: Record<string, unknown>[];
    coincide: boolean;
}

export type GetGeneracionModelo349 = (modeloId: Modelo349Id) => Promise<ResultadoGeneracionModelo349>;

export type PatchGenerarModelo349 = (modeloId: Modelo349Id) => Promise<void>;

export type GetDatosModelo349 = (modeloId: Modelo349Id) => Promise<Operacion349[]>;

export type GetExportAeatModelo349 = (modeloId: Modelo349Id) => Promise<Blob>;

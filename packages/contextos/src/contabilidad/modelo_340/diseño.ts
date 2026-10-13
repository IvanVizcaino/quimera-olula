import type { Entidad } from "@olula/lib/diseño.ts";

export type Modelo340Id = number;

export interface DiffTotalModelo340 extends Entidad {
    clave: string;
    almacenado: number;
    calculado: number;
    delta: number;
}

export interface Registro340 extends Entidad {
    tipolibro: string;
    idenfactura: string;
    apellidosnomrs: string;
    cifnif: string | null;
    baseimponible: number;
    cuotaimpuesto: number;
    operacion: string | null;
}

export interface ResultadoGeneracionModelo340 {
    modeloId: Modelo340Id;
    codejercicio: string;
    registros: number;
    baseimponible: number;
    cuotaimpuesto: number;
    totalfacturas: number;
    emitidas: Registro340[];
    recibidas: Registro340[];
    diffsTotales: DiffTotalModelo340[];
    coincide: boolean;
}

export type GetGeneracionModelo340 = (modeloId: Modelo340Id) => Promise<ResultadoGeneracionModelo340>;

export type PatchGenerarModelo340 = (modeloId: Modelo340Id) => Promise<void>;

export type GetDatosModelo340 = (modeloId: Modelo340Id) => Promise<Registro340[]>;

export type GetExportAeatModelo340 = (modeloId: Modelo340Id) => Promise<Blob>;

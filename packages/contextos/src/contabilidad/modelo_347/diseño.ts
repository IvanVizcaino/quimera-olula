import type { Entidad } from "@olula/lib/diseño.ts";

export type Modelo347Id = number;

export interface DiffTotalModelo347 extends Entidad {
    clave: string;
    almacenado: number;
    calculado: number;
    delta: number;
}

export interface Declarado347 extends Entidad {
    nifdeclarado: string;
    apellidosnombrers: string;
    clavecodigo: string;
    codclienteprov: string;
    codpostal: string | null;
    importe: number;
    importet1: number;
    importet2: number;
    importet3: number;
    importet4: number;
    importemetalico: number;
}

export interface ResultadoGeneracionModelo347 {
    modeloId: Modelo347Id;
    anio: string;
    origen: string;
    totalentidades: number;
    importetotal: number;
    totalinmuebles: number;
    totalarrendamiento: number;
    declarados: Declarado347[];
    diffsTotales: DiffTotalModelo347[];
    diffsDeclarados: Record<string, unknown>[];
    coincide: boolean;
}

export type GetGeneracionModelo347 = (modeloId: Modelo347Id) => Promise<ResultadoGeneracionModelo347>;

export type PatchGenerarModelo347 = (modeloId: Modelo347Id) => Promise<void>;

export type GetDatosModelo347 = (modeloId: Modelo347Id) => Promise<Declarado347[]>;

export type GetExportAeatModelo347 = (modeloId: Modelo347Id) => Promise<Blob>;

/** Campos de captura manual tipo 2i (obligatorios + opcionales del BE). */
export interface CamposInmueble347 {
    nifarrendatario: string;
    apellidosnombrers: string;
    importe: number | string;
    situacion: string;
    refcatastral: string;
    nombrevia: string;
    localidad: string;
    municipio: string;
    codprovincia: string;
    codtipovia?: string;
    tiponumeracion?: string;
    numero?: string;
    califnumero?: string;
    bloque?: string;
    portal?: string;
    escalera?: string;
    piso?: string;
    puerta?: string;
    complemento?: string;
    codmunicipio?: string;
    codpostal?: string;
    nifreplegal?: string;
    codinmueble?: string;
}

export interface Inmueble347 extends Entidad, CamposInmueble347 {
    idregistro: number;
    importe: number;
}

export type GetInmueblesModelo347 = (modeloId: Modelo347Id) => Promise<Inmueble347[]>;

export type PostInmuebleModelo347 = (
    modeloId: Modelo347Id,
    campos: CamposInmueble347
) => Promise<number>;

export type PatchInmuebleModelo347 = (
    modeloId: Modelo347Id,
    registroId: number,
    campos: Partial<CamposInmueble347>
) => Promise<void>;

export type DeleteInmuebleModelo347 = (
    modeloId: Modelo347Id,
    registroId: number
) => Promise<void>;

export type ClaveListado347 = "clientes" | "proveedores";
export type OrdenListado347 = "nombre" | "nif";

export type GetListadoModelo347 = (
    modeloId: Modelo347Id,
    clave?: ClaveListado347,
    orden?: OrdenListado347,
    nif?: string
) => Promise<Blob>;

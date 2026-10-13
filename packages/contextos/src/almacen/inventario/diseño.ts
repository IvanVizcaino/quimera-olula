import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

export interface ItemInventario extends Entidad {
    id: string;
    almacenId: string;
    fecha: Date;
    observaciones: string;
    cerrado: boolean;
}

export interface Inventario extends ItemInventario {
    hora: string | null;
}

export interface LineaInventario extends Entidad {
    id: string;
    inventarioId: string;
    stockId: number;
    referencia: string;
    descripcion: string;
    cantidadIni: number;
    cantidadFin: number;
    codlote: string | null;
}

export interface NuevoInventario extends Modelo {
    id: string;
    almacenId: string;
    fecha: Date;
    observaciones: string;
}

export interface NuevaLineaInventario extends Modelo {
    referencia: string;
    cantidadFin: number;
    codlote: string;
}

export interface OpcionesImportarCsvInventario {
    separador?: string;
    ignorarPrimeraLinea?: boolean;
    colReferencia?: number;
    colCantidad?: number;
}

export interface ResultadoImportarCsvInventario {
    inventarioId: string;
    lecturasImportadas: number;
    lineasActualizadas: number;
}

export interface ResultadoRestoACeroInventario {
    inventarioId: string;
    lineasCreadas: number;
    saltadosPorLotes: number;
}

export interface ResultadoCerrarInventario {
    id: string;
    cerrado: boolean;
}

export interface ResultadoInventarioTotal {
    inventarioId: string;
    lineasCreadas: number;
    saltadosPorLotes: number;
}

export interface MovistockRegularizacion {
    movistockId: string;
    stockId: string;
    referencia: string;
    delta: number;
    cantidadIni: number;
    cantidadFin: number;
}

export interface LineaSaltadaRegularizacion {
    stockId: string;
    referencia: string;
    motivo: string;
}

export interface ResultadoRegularizacionInventario {
    inventarioId: string;
    movistocks: MovistockRegularizacion[];
    saltados: LineaSaltadaRegularizacion[];
}

export type GetInventario = (id: string) => Promise<Inventario>;
export type GetInventarios = (criteria: Criteria) => RespuestaLista<ItemInventario>;
export type GetLineasInventario = (inventarioId: string) => Promise<LineaInventario[]>;
export type PostInventario = (nuevo: NuevoInventario) => Promise<string>;
export type PostLineaInventario = (
    inventarioId: string,
    linea: NuevaLineaInventario
) => Promise<string>;
export type PatchRegularizarInventario = (
    inventarioId: string
) => Promise<ResultadoRegularizacionInventario>;
export type PatchCerrarInventario = (inventarioId: string) => Promise<ResultadoCerrarInventario>;
export type PatchRestoACeroInventario = (
    inventarioId: string
) => Promise<ResultadoRestoACeroInventario>;
export type PostImportarCsvInventario = (
    inventarioId: string,
    contenido: string,
    opciones?: OpcionesImportarCsvInventario
) => Promise<ResultadoImportarCsvInventario>;
export type PostInventarioTotal = (nuevo: NuevoInventario) => Promise<ResultadoInventarioTotal>;
export type GetExportLineasInventarioCsv = (inventarioId: string) => Promise<Blob>;

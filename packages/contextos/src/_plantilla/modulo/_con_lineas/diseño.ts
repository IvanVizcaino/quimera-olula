import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";
import { Modulo, NuevoModulo } from "../diseño.ts";

// Consolidar en un solo interfaz al usar la plantilla con líneas.
export interface ModLin extends Modulo {
    lineas: LineaModulo[];
}

export interface LineaModulo extends Entidad {
    id: string;
    campoString: string
}


export interface NuevaLineaModulo extends Modelo {
    campoString: string
}

/**
 * Entidad ligera para el listado del maestro.
 * El endpoint GET /modulos devuelve estos campos sin las líneas embebidas.
 * Adaptar los campos a lo que devuelva tu API de listado.
 */
export interface ItemModLin extends Entidad {
    id: string;
    campoString: string;
}

export type CambiosModLin = Partial<ModLin>;
export type CambiosLineaModulo = Partial<LineaModulo>;

export type GetModLin = (id: string) => Promise<ModLin>;
export type GetModLins = (criteria: Criteria) => RespuestaLista<ItemModLin>;
export type PostModLin = (nuevoModLin: NuevoModulo) => Promise<string>;
export type PostLineaModulo = (id: string, nuevaLinea: NuevaLineaModulo) => Promise<string>;
export type PatchModLin = (id: string, cambios: CambiosModLin) => Promise<void>;
export type PatchLineaModulo = (id: string, lineaId: string, cambios: CambiosLineaModulo) => Promise<void>;
export type DeleteModLin = (id: string) => Promise<void>;
export type DeleteLineaModulo = (id: string, lineaId: string) => Promise<void>;

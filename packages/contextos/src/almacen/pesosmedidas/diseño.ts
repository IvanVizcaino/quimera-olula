import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

/** Unidad de medida (ext. oficial `pesos_medidas`, T2.7).
 * Tabla Eneboo: `pesosmedidas(codunidad, descripcion, magnitud, factorconv)`.
 */
export interface UnidadMedida extends Entidad {
    id: string;
    descripcion: string;
    magnitud: string;
    factorConv: number;
}

export interface NuevaUnidadMedida extends Modelo {
    id: string;
    descripcion: string;
    magnitud: string;
    factorConv: number;
}

export type CambiosUnidadMedida = Pick<UnidadMedida, "descripcion" | "magnitud" | "factorConv">;

export type GetUnidadMedida = (id: string) => Promise<UnidadMedida>;
export type GetUnidadesMedida = (criteria: Criteria) => RespuestaLista<UnidadMedida>;
export type PostUnidadMedida = (nueva: NuevaUnidadMedida) => Promise<string>;
export type PatchUnidadMedida = (id: string, cambios: Partial<CambiosUnidadMedida>) => Promise<void>;
export type DeleteUnidadMedida = (id: string) => Promise<void>;

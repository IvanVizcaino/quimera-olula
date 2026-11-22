import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

/** Magnitudes de la extensión pesos_medidas de Eneboo (pesosmedidas.magnitud). */
export const MAGNITUDES = ["Unidades", "Longitud", "Superficie", "Volumen", "Peso", "Tiempo", "Otro"] as const;
export type Magnitud = (typeof MAGNITUDES)[number];

/** Unidad de peso o medida (tabla pesosmedidas, plugin pesos_medidas). `id` es la abreviatura. */
export interface PesoMedida extends Entidad {
    id: string;
    descripcion: string;
    magnitud: Magnitud | "";
    /** Factor para convertir entre unidades de la misma magnitud (0: sin conversión). */
    factorConversion: number;
}

export interface NuevoPesoMedida extends Modelo {
    id: string;
    descripcion: string;
    magnitud: Magnitud | "";
    factorConversion: number;
}

export type CambiosPesoMedida = Partial<Omit<PesoMedida, "id">>;

export type GetPesoMedida = (id: string) => Promise<PesoMedida>;
export type GetPesosMedidas = (criteria: Criteria) => RespuestaLista<PesoMedida>;
export type PostPesoMedida = (nuevo: NuevoPesoMedida) => Promise<string>;
export type PatchPesoMedida = (id: string, cambios: CambiosPesoMedida) => Promise<void>;
export type DeletePesoMedida = (id: string) => Promise<void>;

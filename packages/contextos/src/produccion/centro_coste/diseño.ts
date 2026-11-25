import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

/** Centro de coste de la planta (tabla `pr_centroscoste` de Eneboo). */
export interface CentroCoste extends Entidad {
    id: string;
    descripcion: string;
    tipoCentroId: string;
    /** Descripción del tipo de centro (solo lectura). */
    tipoCentro: string;
}

export interface NuevoCentroCoste extends Modelo {
    id: string;
    descripcion: string;
    tipoCentroId: string;
}

export type CambiosCentroCoste = Partial<Pick<CentroCoste, "descripcion" | "tipoCentroId">>;

export type GetCentroCoste = (id: string) => Promise<CentroCoste>;
export type GetCentrosCoste = (criteria: Criteria) => RespuestaLista<CentroCoste>;
export type PostCentroCoste = (nuevo: NuevoCentroCoste) => Promise<string>;
export type PatchCentroCoste = (id: string, cambios: CambiosCentroCoste) => Promise<void>;
export type DeleteCentroCoste = (id: string) => Promise<void>;

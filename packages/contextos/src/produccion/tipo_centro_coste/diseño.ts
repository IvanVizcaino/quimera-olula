import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

/** Tipo de centro de coste (tabla `pr_tiposcentrocoste` de Eneboo). */
export interface TipoCentroCoste extends Entidad {
    id: string;
    descripcion: string;
}

export interface NuevoTipoCentroCoste extends Modelo {
    id: string;
    descripcion: string;
}

export type CambiosTipoCentroCoste = Partial<Pick<TipoCentroCoste, "descripcion">>;

export type GetTipoCentroCoste = (id: string) => Promise<TipoCentroCoste>;
export type GetTiposCentroCoste = (criteria: Criteria) => RespuestaLista<TipoCentroCoste>;
export type PostTipoCentroCoste = (nuevo: NuevoTipoCentroCoste) => Promise<string>;
export type PatchTipoCentroCoste = (id: string, cambios: CambiosTipoCentroCoste) => Promise<void>;
export type DeleteTipoCentroCoste = (id: string) => Promise<void>;

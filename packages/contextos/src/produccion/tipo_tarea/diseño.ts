import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

/** Tipo de tarea (tabla `pr_tipostarea` de Eneboo): la tarea genérica que usan los tipos de proceso. */
export interface TipoTarea extends Entidad {
    id: string;
    descripcion: string;
    /** Informativo (Eneboo no lo calcula ni lo usa); `null` mientras el campo está vacío. */
    tiempoMedio: number | null;
}

export interface NuevoTipoTarea extends Modelo {
    id: string;
    descripcion: string;
    tiempoMedio: number | null;
}

export type CambiosTipoTarea = Partial<Pick<TipoTarea, "descripcion" | "tiempoMedio">>;

export type GetTipoTarea = (id: string) => Promise<TipoTarea>;
export type GetTiposTarea = (criteria: Criteria) => RespuestaLista<TipoTarea>;
export type PostTipoTarea = (nuevo: NuevoTipoTarea) => Promise<string>;
export type PatchTipoTarea = (id: string, cambios: CambiosTipoTarea) => Promise<void>;
export type DeleteTipoTarea = (id: string) => Promise<void>;

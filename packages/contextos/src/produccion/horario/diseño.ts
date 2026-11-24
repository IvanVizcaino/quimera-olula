import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

/** Horas de un horario: "HH:MM" en el formulario; vacía si no hay. */
export interface HorasHorario {
    horaEntradaManana: string;
    horaSalidaManana: string;
    horaEntradaTarde: string;
    horaSalidaTarde: string;
}

/** Horario de trabajo (tabla `pr_horarios` de Eneboo). */
export interface Horario extends Entidad, HorasHorario {
    id: string;
    descripcion: string;
    /** Milisegundos de trabajo (mañana más tarde); lo calcula el servidor. */
    tiempo: number;
}

export interface NuevoHorario extends Modelo, HorasHorario {
    id: string;
    descripcion: string;
}

export type CambiosHorario = Partial<HorasHorario & { descripcion: string }>;

export type GetHorario = (id: string) => Promise<Horario>;
export type GetHorarios = (criteria: Criteria) => RespuestaLista<Horario>;
export type PostHorario = (nuevo: NuevoHorario) => Promise<string>;
export type PatchHorario = (id: string, cambios: CambiosHorario) => Promise<void>;
export type DeleteHorario = (id: string) => Promise<void>;

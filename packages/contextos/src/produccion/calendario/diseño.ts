import { Entidad } from "@olula/lib/diseño.ts";
import { HorasHorario } from "../horario/diseño.ts";

/** Día del calendario laboral (tabla `pr_calendario` de Eneboo). `id` es la fecha. */
export interface DiaCalendario extends Entidad, HorasHorario {
    /** La fecha "AAAA-MM-DD" (la clave de `pr_calendario`). */
    id: string;
    fecha: string;
    /** Día de la semana. */
    descripcion: string;
    /** Vacío: día no laborable. */
    horarioId: string;
    /** Descripción del horario. */
    horario: string;
    /** Milisegundos de trabajo del día. */
    tiempo: number;
}

/** Datos para generar el calendario de `desde` a `hasta` (fechas "AAAA-MM-DD"). */
export interface GeneracionCalendario {
    desde: string;
    hasta: string;
    /** Horario de lunes a viernes (obligatorio). */
    horarioLaboralId: string;
    /** Vacío: los sábados no son laborables. */
    horarioSabadoId: string;
    /** Vacío: los domingos no son laborables. */
    horarioDomingoId: string;
}

export interface ResultadoGeneracion {
    desde: string;
    hasta: string;
    /** Días generados. */
    dias: number;
}

export type GetCalendarioRango = (desde: string, hasta: string) => Promise<DiaCalendario[]>;
export type PostGenerarCalendario = (generacion: GeneracionCalendario) => Promise<ResultadoGeneracion>;
/** `horarioId` vacío: el día pasa a no laborable. */
export type PatchDiaCalendario = (fecha: string, horarioId: string) => Promise<void>;

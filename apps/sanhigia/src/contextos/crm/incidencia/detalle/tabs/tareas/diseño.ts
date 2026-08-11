import { Entidad, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";

export interface Tarea extends Entidad {
    id: string;
    titulo: string;
    fecha: string;
    hora: string;
    tipo: string;
    completada: boolean;
    agenteId?: string | null;
    nota?: string | null;
    tratoId?: string | null;
    incidenciaId?: string | null;
    idTareaGoogle?: string | null;
    fechaFin?: string | null;
    horaFin?: string | null;
    latitudFin?: string | null;
    longitudFin?: string | null;
}

export type GetTareas = (
    incidenciaId: string,
    paginacion?: Paginacion
) => RespuestaLista<Tarea>;

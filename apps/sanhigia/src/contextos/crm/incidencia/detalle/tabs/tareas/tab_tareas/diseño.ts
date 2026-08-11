import { Tarea } from "../diseño.ts";

export type EstadoTareas = "lista";

export type ContextoTareas = {
    estado: EstadoTareas;
    tareas: Tarea[];
    cargando: boolean;
    incidenciaId: string;
};

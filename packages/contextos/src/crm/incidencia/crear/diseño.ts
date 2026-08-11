import { EstadoIncidencia, PrioridadIncidencia, TipoIncidencia } from "../diseño.ts";

export type NuevaIncidencia = {
    descripcion: string;
    descripcion_larga: string;
    nombre: string;
    tipo_incidencia?: TipoIncidencia;
    prioridad: PrioridadIncidencia;
    estado: EstadoIncidencia;
    fecha: Date;
};
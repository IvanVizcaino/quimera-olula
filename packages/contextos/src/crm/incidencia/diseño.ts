import { Entidad, Filtro, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";
import { Accion } from "../accion/diseño.ts";

export type PrioridadIncidencia = "alta" | "media" | "baja";
export type EstadoIncidencia = "nueva" | "en_espera" | "asignada" | "rechazada" | "cerrada";
export type TipoIncidencia = 'Proveedor' | 'Transportista';

export interface Incidencia extends Entidad {
    id: string;
    descripcion: string;
    descripcion_larga: string;
    resolucion: string;
    nombre: string;
    responsable_id: string | null;
    prioridad: PrioridadIncidencia;
    estado: EstadoIncidencia;
    tipo_incidencia?: TipoIncidencia;
    fecha: Date
}

export type GetIncidencia = (id: string) => Promise<Incidencia>;

export type GetIncidencias = (
    filtro: Filtro,
    orden: Orden,
    paginacion: Paginacion
) => RespuestaLista<Incidencia>;

export type GetAccionesIncidencia = (id: string) => Promise<Accion[]>;

export type PostIncidencia = (incidencia: Partial<Incidencia>) => Promise<string>;
export type PatchIncidencia = (id: string, incidencia: Partial<Incidencia>) => Promise<void>;
export type DeleteIncidencia = (id: string) => Promise<void>;
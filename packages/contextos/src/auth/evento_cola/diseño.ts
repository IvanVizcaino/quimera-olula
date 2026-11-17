import { Entidad } from "@olula/lib/diseño.ts";

/** Registro de la cola asíncrona (flcolas.mtd). */
export interface EventoCola extends Entidad {
    id: string;
    padreId: string | null;
    colaId: string;
    tipo: string;
    estado: string;
    numIntento: number;
    usuarioId: string | null;
    clave: string | null;
    creacion: string | null;
    programada: string | null;
    inicio: string | null;
    fin: string | null;
    /** Primera línea de datos_error. */
    error: string;
}

/** Ficha (flcolas.ui): además, la entrada del evento y la traza del error. */
export interface EventoColaDetalle extends EventoCola {
    payload: string | null;
    datosError: string | null;
}

export type EventoColaApi = {
    id: string;
    padre_id: string | null;
    cola_id: string;
    tipo: string;
    estado: string;
    num_intento: number;
    usuario_id: string | null;
    clave: string | null;
    timestamp_creacion: string | null;
    timestamp_ejecucion_programada: string | null;
    timestamp_inicio: string | null;
    timestamp_fin: string | null;
    error: string;
    error_detalle: string | null;
};

export type EventoColaDetalleApi = EventoColaApi & {
    payload: string | null;
    datos_error: string | null;
};

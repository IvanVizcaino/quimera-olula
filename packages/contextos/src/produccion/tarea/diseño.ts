import { Criteria, Entidad, RespuestaLista } from "@olula/lib/diseño.ts";

/** Estados de una tarea del proceso (`pr_tareas.estado`). OFF: aún no activa o de un proceso sacado. */
export type EstadoTarea = "OFF" | "PTE" | "EN CURSO" | "EN PAUSA" | "TERMINADA";

/** Acciones sobre una tarea (rutas `POST /produccion/tarea/<id>/<accion>`). */
export type AccionTarea = "iniciar" | "pausar" | "terminar" | "deshacer";

/**
 * Tarea de un proceso de producción con su orden, lote y artículo (consulta
 * `consulta.produccion.tarea`, también las `tareas` de la orden). Fechas "AAAA-MM-DD" y horas
 * "HH:MM:SS"; los textos que faltan, "".
 */
export interface TareaProduccion extends Entidad {
    /** `TA` + 6 dígitos. */
    id: string;
    procesoId: string;
    ordenId: string;
    estado: EstadoTarea;
    /** Código de su tarea del tipo de proceso. */
    codigo: string;
    descripcion: string;
    tareaProcesoId: string;
    tipoTareaId: string;
    tipoProcesoId: string;
    /** Orden de la tarea en el tipo de proceso. */
    orden: number;
    inicial: boolean;
    final: boolean;
    terminaEnUnPaso: boolean;
    centroId: string;
    /** Trabajador que la realiza (código) y su nombre. */
    realizadaPor: string;
    trabajador: string;
    diaInicio: string;
    tiempoInicio: string;
    diaFin: string;
    tiempoFin: string;
    /** Segundos entre el inicio y el fin. */
    intervalo: number | null;
    /** En la unidad de tiempo del tipo de proceso. */
    tiempoInvertido: number | null;
    estadoProceso: string;
    estadoOrden: string;
    loteId: string;
    articuloId: string;
    articulo: string;
    /** Cantidad del lote. */
    cantidad: number | null;
}

export type GetTarea = (id: string) => Promise<TareaProduccion>;
export type GetTareas = (criteria: Criteria) => RespuestaLista<TareaProduccion>;
/** Ejecuta la acción; `trabajadorId` solo al iniciar (opcional). */
export type PostAccionTarea = (id: string, accion: AccionTarea, trabajadorId?: string) => Promise<void>;

/**
 * Producción > Informe de tareas (`pr_i_tareas` / `pr_i_tareascc` de Eneboo). Las fichas de
 * criterios usan el patrón común de `comun/informe_documentos`; el resultado es propio: tareas
 * con sus tiempos previsto y real, agrupadas por centro de coste si la ficha lo pide.
 */

export type FormatoHoja = "xlsx" | "ods";

export interface FilaInformeTareas {
    ordenId: string;
    pedidoId: string;
    clienteId: string;
    cliente: string;
    tareaId: string;
    loteId: string;
    estado: string;
    descripcion: string;
    /** Fechas "AAAA-MM-DD" o vacías. */
    fechaPrevista: string;
    diaInicio: string;
    diaFin: string;
    centroId: string;
    tiempoPrevisto: number;
    tiempoReal: number;
    /** Previsto − real (como Eneboo): negativa si se ha tardado más. */
    diferencia: number;
    /** Unidad de tiempo del tipo de proceso. */
    unidad: string;
}

export interface GrupoInformeTareas {
    /** `null`: sin agrupar, o las tareas sin centro. */
    centroId: string | null;
    centro: string;
    tipoCentroId: string;
    filas: FilaInformeTareas[];
    totalPrevisto: number;
    totalReal: number;
    totalDiferencia: number;
}

export interface ResultadoInformeTareas {
    titulo: string;
    /** Por centros de coste. */
    agrupado: boolean;
    /** Criterios en una línea. */
    subtitulo: string;
    grupos: GrupoInformeTareas[];
    totalPrevisto: number;
    totalReal: number;
    totalDiferencia: number;
    totalTareas: number;
}

export type GetResultadoInformeTareas = (id: string) => Promise<ResultadoInformeTareas>;
export type GetReportInformeTareas = (id: string) => Promise<Blob>;
export type GetHojaInformeTareas = (id: string, formato: FormatoHoja) => Promise<Blob>;

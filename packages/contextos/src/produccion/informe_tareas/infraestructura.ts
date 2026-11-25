import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    FilaInformeTareas,
    FormatoHoja,
    GetHojaInformeTareas,
    GetReportInformeTareas,
    GetResultadoInformeTareas,
    GrupoInformeTareas,
    ResultadoInformeTareas,
} from "./diseño.ts";

export const URL_INFORME_TAREAS = "/produccion/informe/tareas";

interface FilaInformeTareasApi {
    orden_id: string;
    pedido_id: string | null;
    cliente_id: string | null;
    cliente: string | null;
    tarea_id: string;
    lote_id: string | null;
    estado: string;
    descripcion: string | null;
    fecha_prevista: string | null;
    dia_inicio: string | null;
    dia_fin: string | null;
    centro_id: string | null;
    tiempo_previsto: number | null;
    tiempo_real: number | null;
    diferencia: number | null;
    unidad: string | null;
}

interface GrupoInformeTareasApi {
    centro_id: string | null;
    centro: string | null;
    tipo_centro_id: string | null;
    filas: FilaInformeTareasApi[];
    total_previsto: number | null;
    total_real: number | null;
    total_diferencia: number | null;
}

export interface ResultadoInformeTareasApi {
    titulo: string;
    agrupado: boolean;
    subtitulo: string | null;
    grupos: GrupoInformeTareasApi[];
    total_previsto: number | null;
    total_real: number | null;
    total_diferencia: number | null;
    total_tareas: number | null;
}

const texto = (valor: string | null | undefined): string => valor ?? "";
const numero = (valor: number | string | null | undefined): number => Number(valor ?? 0) || 0;
const fecha = (valor: string | null | undefined): string => texto(valor).slice(0, 10);

export const filaInformeTareasDesdeApi = (api: FilaInformeTareasApi): FilaInformeTareas => ({
    ordenId: api.orden_id,
    pedidoId: texto(api.pedido_id),
    clienteId: texto(api.cliente_id),
    cliente: texto(api.cliente),
    tareaId: api.tarea_id,
    loteId: texto(api.lote_id),
    estado: api.estado,
    descripcion: texto(api.descripcion),
    fechaPrevista: fecha(api.fecha_prevista),
    diaInicio: fecha(api.dia_inicio),
    diaFin: fecha(api.dia_fin),
    centroId: texto(api.centro_id),
    tiempoPrevisto: numero(api.tiempo_previsto),
    tiempoReal: numero(api.tiempo_real),
    diferencia: numero(api.diferencia),
    unidad: texto(api.unidad),
});

const grupoDesdeApi = (api: GrupoInformeTareasApi): GrupoInformeTareas => ({
    centroId: api.centro_id ?? null,
    centro: texto(api.centro),
    tipoCentroId: texto(api.tipo_centro_id),
    filas: (api.filas ?? []).map(filaInformeTareasDesdeApi),
    totalPrevisto: numero(api.total_previsto),
    totalReal: numero(api.total_real),
    totalDiferencia: numero(api.total_diferencia),
});

export const resultadoInformeTareasDesdeApi = (api: ResultadoInformeTareasApi): ResultadoInformeTareas => ({
    titulo: api.titulo,
    agrupado: !!api.agrupado,
    subtitulo: texto(api.subtitulo),
    grupos: (api.grupos ?? []).map(grupoDesdeApi),
    totalPrevisto: numero(api.total_previsto),
    totalReal: numero(api.total_real),
    totalDiferencia: numero(api.total_diferencia),
    totalTareas: numero(api.total_tareas),
});

const url = (id: string) => `${URL_INFORME_TAREAS}/${encodeURIComponent(id)}`;

export const urlResultadoInformeTareas = (id: string): string => `${url(id)}/resultado`;
export const urlReportInformeTareas = (id: string): string => `${url(id)}/report`;
export const urlHojaInformeTareas = (id: string, formato: FormatoHoja): string => `${url(id)}/hoja?formato=${formato}`;

export const getResultadoInformeTareas: GetResultadoInformeTareas = async (id) =>
    RestAPI.getItem<ResultadoInformeTareas, ResultadoInformeTareasApi>(
        urlResultadoInformeTareas(id),
        resultadoInformeTareasDesdeApi,
        "Error al calcular el informe de tareas"
    );

export const getReportInformeTareas: GetReportInformeTareas = async (id) =>
    RestAPI.blob(urlReportInformeTareas(id), "Error al descargar el PDF del informe de tareas");

export const getHojaInformeTareas: GetHojaInformeTareas = async (id, formato) =>
    RestAPI.blob(urlHojaInformeTareas(id, formato), "Error al descargar la hoja del informe de tareas");

import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import { AccionesCicloVida, getAccionesCicloVida } from "../comun/ciclo_vida.ts";
import { AccionTarea, EstadoTarea, GetTarea, GetTareas, PostAccionTarea, TareaProduccion } from "./diseño.ts";
import { AGREGADO_TAREA, criteriaTareasApi } from "./dominio.ts";

const baseUrl = `/produccion/tarea`;

export interface TareaApi {
    id: string;
    proceso_id: string | number;
    orden_id: string | null;
    estado: string | null;
    codigo: string | null;
    descripcion: string | null;
    tarea_proceso_id: string | number | null;
    tipo_tarea_id: string | null;
    tipo_proceso_id: string | null;
    orden: number | null;
    inicial: boolean | null;
    final: boolean | null;
    termina_en_un_paso: boolean | null;
    centro_id: string | null;
    realizada_por: string | null;
    trabajador?: string | null;
    dia_inicio: string | null;
    tiempo_inicio: string | null;
    dia_fin: string | null;
    tiempo_fin: string | null;
    intervalo: number | string | null;
    tiempo_invertido: number | string | null;
    estado_proceso?: string | null;
    estado_orden?: string | null;
    lote_id?: string | null;
    articulo_id?: string | null;
    articulo?: string | null;
    cantidad?: number | string | null;
}

const texto = (valor: string | number | null | undefined): string =>
    valor === null || valor === undefined ? "" : String(valor);
const numeroONull = (valor: number | string | null | undefined): number | null => {
    if (valor === null || valor === undefined || valor === "") return null;
    const numero = Number(valor);
    return Number.isNaN(numero) ? null : numero;
};

/** También lee las tareas del proceso que devuelven los comandos (sin orden ni lote). */
export const tareaDesdeApi = (api: TareaApi): TareaProduccion => ({
    id: api.id,
    procesoId: texto(api.proceso_id),
    ordenId: texto(api.orden_id),
    estado: (api.estado || "OFF") as EstadoTarea,
    codigo: texto(api.codigo),
    descripcion: texto(api.descripcion),
    tareaProcesoId: texto(api.tarea_proceso_id),
    tipoTareaId: texto(api.tipo_tarea_id),
    tipoProcesoId: texto(api.tipo_proceso_id),
    orden: Number(api.orden ?? 0) || 0,
    inicial: !!api.inicial,
    final: !!api.final,
    terminaEnUnPaso: !!api.termina_en_un_paso,
    centroId: texto(api.centro_id),
    realizadaPor: texto(api.realizada_por),
    trabajador: texto(api.trabajador),
    diaInicio: texto(api.dia_inicio).slice(0, 10),
    tiempoInicio: texto(api.tiempo_inicio),
    diaFin: texto(api.dia_fin).slice(0, 10),
    tiempoFin: texto(api.tiempo_fin),
    intervalo: numeroONull(api.intervalo),
    tiempoInvertido: numeroONull(api.tiempo_invertido),
    estadoProceso: texto(api.estado_proceso),
    estadoOrden: texto(api.estado_orden),
    loteId: texto(api.lote_id),
    articuloId: texto(api.articulo_id),
    articulo: texto(api.articulo),
    cantidad: numeroONull(api.cantidad),
});

/** Cuerpo de la acción: el trabajador solo al iniciar y si se indica. */
export const cuerpoAccionTarea = (accion: AccionTarea, trabajadorId?: string): { trabajador_id?: string } =>
    accion === "iniciar" && trabajadorId && trabajadorId.trim() ? { trabajador_id: trabajadorId.trim() } : {};

const url = (id: string) => `${baseUrl}/${encodeURIComponent(id)}`;

const mensajes: Record<AccionTarea, string> = {
    iniciar: "Error al iniciar la tarea",
    pausar: "Error al pausar la tarea",
    terminar: "Error al terminar la tarea",
    deshacer: "Error al deshacer la tarea",
};

export const getTarea: GetTarea = async (id) => RestAPI.getItem<TareaProduccion, TareaApi>(url(id), tareaDesdeApi);

export const getTareas: GetTareas = async (criteria: Criteria) =>
    RestAPI.getQuery<TareaProduccion, TareaApi>(baseUrl, criteriaTareasApi(criteria), tareaDesdeApi);

export const getAccionesTarea = (id: string): Promise<AccionesCicloVida> => getAccionesCicloVida(AGREGADO_TAREA, id);

export const postAccionTarea: PostAccionTarea = async (id, accion, trabajadorId) => {
    await RestAPI.post(`${url(id)}/${accion}`, cuerpoAccionTarea(accion, trabajadorId), mensajes[accion]);
};

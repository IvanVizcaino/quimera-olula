import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import { comoBooleano } from "../comun/dominio.ts";
import {
    CambiosTipoProceso,
    CopiarTipoProceso,
    DeleteSecuencia,
    DeleteTareaProceso,
    DeleteTipoProceso,
    FormTareaProceso,
    GetTareasProceso,
    GetTipoProceso,
    GetTiposProceso,
    NuevoTipoProceso,
    PatchTareaProceso,
    PatchTipoProceso,
    PostSecuencia,
    PostTareaProceso,
    PostTipoProceso,
    Secuencia,
    TareaProceso,
    TareaProcesoItem,
    TipoProceso,
    TipoProduccion,
    UnidadTiempo,
} from "./diseño.ts";

const baseUrl = `/produccion/tipo_proceso`;

export interface TareaProcesoApi {
    id: string | number;
    tipo_proceso_id?: string;
    tipo_proceso?: string | null;
    tipo_tarea_id: string;
    tipo_tarea?: string | null;
    descripcion: string | null;
    orden: number | null;
    codigo: string | null;
    inicial: boolean;
    final: boolean;
    termina_en_un_paso: boolean;
    verificar_consumos: boolean;
    opcional: boolean;
}

export interface SecuenciaApi {
    id: string;
    tarea_inicio_id: string | number;
    codigo_inicio: string | null;
    descripcion_inicio: string | null;
    tarea_fin_id: string | number;
    codigo_fin: string | null;
    descripcion_fin: string | null;
    requerida: boolean;
}

export interface TipoProcesoApi {
    id: string;
    descripcion: string | null;
    tiempo_medio: number | null;
    tiempo_unidad: number | null;
    unidad: string | null;
    generar_todas: boolean | null;
    secuencial: boolean | null;
    fabricacion: boolean | null;
    tipo_produccion: string | null;
    tareas?: TareaProcesoApi[];
    secuencias?: SecuenciaApi[];
    completo?: boolean;
    motivos_incompleto?: string[];
}

/** Eneboo guardaba «Dias» sin tilde; se lee como «Días». */
const unidadDesdeApi = (unidad: string | null): UnidadTiempo =>
    unidad === "Dias" ? "Días" : ((unidad || "Segundos") as UnidadTiempo);

export const tareaProcesoDesdeApi = (api: TareaProcesoApi): TareaProceso => ({
    id: String(api.id),
    tipoTareaId: api.tipo_tarea_id,
    tipoTarea: api.tipo_tarea ?? "",
    descripcion: api.descripcion ?? "",
    orden: api.orden ?? 0,
    codigo: api.codigo ?? "",
    inicial: !!api.inicial,
    final: !!api.final,
    terminaEnUnPaso: !!api.termina_en_un_paso,
    verificarConsumos: !!api.verificar_consumos,
    opcional: !!api.opcional,
});

export const tareaProcesoItemDesdeApi = (api: TareaProcesoApi): TareaProcesoItem => ({
    ...tareaProcesoDesdeApi(api),
    tipoProcesoId: api.tipo_proceso_id ?? "",
    tipoProceso: api.tipo_proceso ?? "",
});

const secuenciaDesdeApi = (api: SecuenciaApi): Secuencia => ({
    id: `${api.tarea_inicio_id}-${api.tarea_fin_id}`,
    tareaInicioId: String(api.tarea_inicio_id),
    codigoInicio: api.codigo_inicio ?? "",
    descripcionInicio: api.descripcion_inicio ?? "",
    tareaFinId: String(api.tarea_fin_id),
    codigoFin: api.codigo_fin ?? "",
    descripcionFin: api.descripcion_fin ?? "",
    requerida: !!api.requerida,
});

export const tipoProcesoDesdeApi = (api: TipoProcesoApi): TipoProceso => ({
    id: api.id,
    descripcion: api.descripcion ?? "",
    tiempoMedio: api.tiempo_medio ?? null,
    tiempoUnidad: api.tiempo_unidad ?? null,
    unidad: unidadDesdeApi(api.unidad),
    tipoProduccion: (api.tipo_produccion || "Fabricación") as TipoProduccion,
    generarTodas: !!api.generar_todas,
    secuencial: !!api.secuencial,
    fabricacion: !!api.fabricacion,
    tareas: (api.tareas ?? []).map(tareaProcesoDesdeApi),
    secuencias: (api.secuencias ?? []).map(secuenciaDesdeApi),
    // La lista y los comandos no lo traen: solo la consulta por id.
    completo: api.completo ?? true,
    motivosIncompleto: api.motivos_incompleto ?? [],
});

type CambiosTipoProcesoApi = {
    descripcion?: string;
    tiempo_medio?: number | null;
    unidad?: string;
    tipo_produccion?: string;
    generar_todas?: boolean;
    secuencial?: boolean;
    fabricacion?: boolean;
};

export const cambiosTipoProcesoAApi = (c: CambiosTipoProceso): CambiosTipoProcesoApi => {
    const cambios: CambiosTipoProcesoApi = {};
    if (c.descripcion !== undefined) cambios.descripcion = c.descripcion ?? "";
    if (c.tiempoMedio !== undefined) cambios.tiempo_medio = c.tiempoMedio === null ? null : Number(c.tiempoMedio);
    if (c.unidad !== undefined) cambios.unidad = c.unidad;
    if (c.tipoProduccion !== undefined) cambios.tipo_produccion = c.tipoProduccion;
    if (c.generarTodas !== undefined) cambios.generar_todas = comoBooleano(c.generarTodas);
    if (c.secuencial !== undefined) cambios.secuencial = comoBooleano(c.secuencial);
    if (c.fabricacion !== undefined) cambios.fabricacion = comoBooleano(c.fabricacion);
    return cambios;
};

/** Datos de la tarea para la API: sin descripción ni orden, los pone el servidor. */
export const tareaAApi = (t: FormTareaProceso) => ({
    tipo_tarea_id: t.tipoTareaId,
    ...(t.descripcion?.trim() ? { descripcion: t.descripcion.trim() } : {}),
    ...(t.orden !== null && t.orden !== undefined && String(t.orden) !== "" ? { orden: Number(t.orden) } : {}),
    inicial: comoBooleano(t.inicial),
    final: comoBooleano(t.final),
    termina_en_un_paso: comoBooleano(t.terminaEnUnPaso),
    verificar_consumos: comoBooleano(t.verificarConsumos),
    opcional: comoBooleano(t.opcional),
});

const url = (id: string) => `${baseUrl}/${encodeURIComponent(id)}`;

export const getTipoProceso: GetTipoProceso = async (id) =>
    RestAPI.getItem<TipoProceso, TipoProcesoApi>(url(id), tipoProcesoDesdeApi);

export const getTiposProceso: GetTiposProceso = async (criteria: Criteria) =>
    RestAPI.getQuery<TipoProceso, TipoProcesoApi>(baseUrl, criteria, tipoProcesoDesdeApi);

/** Tareas de todos los tipos de proceso (filtrables por `tipo_proceso_id`). */
export const getTareasProceso: GetTareasProceso = async (criteria: Criteria) =>
    RestAPI.getQuery<TareaProcesoItem, TareaProcesoApi>(`/produccion/tarea_proceso`, criteria, tareaProcesoItemDesdeApi);

export const postTipoProceso: PostTipoProceso = async (nuevo: NuevoTipoProceso) => {
    const respuesta = await RestAPI.post(
        baseUrl,
        {
            id: nuevo.id.trim(),
            descripcion: nuevo.descripcion,
            unidad: nuevo.unidad,
            tipo_produccion: nuevo.tipoProduccion,
            fabricacion: comoBooleano(nuevo.fabricacion),
            secuencial: comoBooleano(nuevo.secuencial),
        },
        "Error al crear el tipo de proceso");
    return respuesta.id;
};

export const patchTipoProceso: PatchTipoProceso = async (id, cambios) => {
    await RestAPI.patch(url(id), cambiosTipoProcesoAApi(cambios), "Error al guardar el tipo de proceso");
};

export const deleteTipoProceso: DeleteTipoProceso = async (id) => {
    await RestAPI.delete(url(id), "Error al borrar el tipo de proceso");
};

export const copiarTipoProceso: CopiarTipoProceso = async (id, copia) => {
    const respuesta = await RestAPI.post(
        `${url(id)}/copiar`,
        { nuevo_id: copia.nuevoId.trim(), descripcion: copia.descripcion?.trim() || null },
        "Error al copiar el tipo de proceso");
    return respuesta.id;
};

export const postTareaProceso: PostTareaProceso = async (id, tarea) => {
    await RestAPI.post(`${url(id)}/tarea`, tareaAApi(tarea), "Error al añadir la tarea");
};

export const patchTareaProceso: PatchTareaProceso = async (id, tareaId, tarea) => {
    await RestAPI.patch(
        `${url(id)}/tarea/${encodeURIComponent(tareaId)}`, tareaAApi(tarea), "Error al cambiar la tarea");
};

export const deleteTareaProceso: DeleteTareaProceso = async (id, tareaId) => {
    await RestAPI.delete(`${url(id)}/tarea/${encodeURIComponent(tareaId)}`, "Error al quitar la tarea");
};

export const postSecuencia: PostSecuencia = async (id, inicioId, finId, requerida) => {
    await RestAPI.post(
        `${url(id)}/secuencia`, { tarea_inicio_id: inicioId, tarea_fin_id: finId, requerida },
        "Error al añadir la secuencia");
};

export const deleteSecuencia: DeleteSecuencia = async (id, inicioId, finId) => {
    await RestAPI.delete(
        `${url(id)}/secuencia/${encodeURIComponent(inicioId)}/${encodeURIComponent(finId)}`,
        "Error al quitar la secuencia");
};

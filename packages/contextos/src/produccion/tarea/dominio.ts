import { EstadoEtiqueta } from "#/comun/diseño.ts";
import { ClausulaFiltro, Criteria } from "@olula/lib/diseño.ts";
import { AccionesCicloVida, cabeAccion, motivoAccion } from "../comun/ciclo_vida.ts";
import { fechaDdMmAaaa } from "../comun/dominio.ts";
import { AccionTarea, EstadoTarea, TareaProduccion } from "./diseño.ts";

/** Agregado del ciclo de vida de la tarea (`comandos/produccion/tarea/ciclo_vida.yaml`). */
export const AGREGADO_TAREA = "produccion.tarea";

export const COMANDO_TAREA: Record<AccionTarea, string> = {
    iniciar: "produccion.tarea.iniciar",
    pausar: "produccion.tarea.pausar",
    terminar: "produccion.tarea.terminar",
    deshacer: "produccion.tarea.deshacer",
};

export const ACCIONES_TAREA: { accion: AccionTarea; texto: string }[] = [
    { accion: "iniciar", texto: "Iniciar" },
    { accion: "pausar", texto: "Pausar" },
    { accion: "terminar", texto: "Terminar" },
    { accion: "deshacer", texto: "Deshacer" },
];

/**
 * En qué estados cabe cada acción (lo mismo que el ciclo de vida del servidor). Solo decide
 * mientras no se han leído las acciones del ciclo de vida, o si no se pueden leer.
 */
const ESTADOS_ACCION: Record<AccionTarea, EstadoTarea[]> = {
    iniciar: ["PTE", "EN PAUSA"],
    pausar: ["EN CURSO"],
    terminar: ["EN CURSO"],
    deshacer: ["EN CURSO", "EN PAUSA", "TERMINADA"],
};

export const ESTADOS_TAREA: { valor: EstadoTarea; descripcion: string }[] = [
    { valor: "OFF", descripcion: "Inactiva" },
    { valor: "PTE", descripcion: "Pendiente" },
    { valor: "EN CURSO", descripcion: "En curso" },
    { valor: "EN PAUSA", descripcion: "En pausa" },
    { valor: "TERMINADA", descripcion: "Terminada" },
];

const etiquetas: Record<EstadoTarea, EstadoEtiqueta> = {
    OFF: { texto: "Inactiva", tono: "borrador" },
    PTE: { texto: "Pendiente", tono: "pendiente" },
    "EN CURSO": { texto: "En curso", tono: "parcial" },
    "EN PAUSA": { texto: "En pausa", tono: "error" },
    TERMINADA: { texto: "Terminada", tono: "completado" },
};

/** Píldora del estado de la tarea (cada estado con su color). */
export const etiquetaEstadoTarea = (estado: string | null | undefined): EstadoEtiqueta =>
    etiquetas[(estado ?? "") as EstadoTarea] ?? { texto: estado || "—", tono: "borrador" };

const descripcionEstado = (estado: string): string =>
    ESTADOS_TAREA.find((e) => e.valor === estado)?.descripcion.toLowerCase() ?? estado;

/** Si cabe la acción: por el ciclo de vida (estado y permiso) o, sin él, por el estado de la tarea. */
export const cabeAccionTarea = (
    tarea: Pick<TareaProduccion, "estado">,
    acciones: AccionesCicloVida | null,
    accion: AccionTarea,
): boolean => cabeAccion(acciones, COMANDO_TAREA[accion], ESTADOS_ACCION[accion].includes(tarea.estado));

/** Por qué no cabe la acción (el motivo del ciclo de vida o uno por el estado); `undefined` si cabe. */
export const motivoAccionTarea = (
    tarea: Pick<TareaProduccion, "estado">,
    acciones: AccionesCicloVida | null,
    accion: AccionTarea,
): string | undefined => {
    if (cabeAccionTarea(tarea, acciones, accion)) return undefined;
    const texto = ACCIONES_TAREA.find((a) => a.accion === accion)?.texto.toLowerCase() ?? accion;
    return motivoAccion(acciones, COMANDO_TAREA[accion])
        ?? `No se puede ${texto} una tarea ${descripcionEstado(tarea.estado)}`;
};

/** Día ("AAAA-MM-DD") y hora ("HH:MM:SS") en "dd/mm/aaaa HH:MM"; vacío si no hay día. */
export const fechaHora = (dia: string | null | undefined, hora: string | null | undefined): string => {
    if (!dia) return "";
    const corta = hora ? hora.slice(0, 5) : "";
    return corta ? `${fechaDdMmAaaa(dia)} ${corta}` : fechaDdMmAaaa(dia);
};

/** Segundos en "h:mm:ss" (3725 → "1:02:05"); vacío si no hay. */
export const duracion = (segundos: number | null | undefined): string => {
    if (segundos === null || segundos === undefined || Number.isNaN(Number(segundos))) return "";
    const total = Math.max(0, Math.round(Number(segundos)));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

/** "T01 - Nombre" (o solo el código si no hay nombre). */
export const textoTrabajador = (t: Pick<TareaProduccion, "realizadaPor" | "trabajador">): string =>
    t.realizadaPor ? (t.trabajador ? `${t.realizadaPor} - ${t.trabajador}` : t.realizadaPor) : "";

/** "Inicial", "Final", "Inicial y final" o vacío. */
export const textoInicialFinal = (t: Pick<TareaProduccion, "inicial" | "final">): string =>
    t.inicial && t.final ? "Inicial y final" : t.inicial ? "Inicial" : t.final ? "Final" : "";

/** Por orden de producción (las más recientes primero) y por el orden de la tarea en el proceso. */
export const ORDEN_TAREAS_DEFECTO = ["orden_id", "DESC", "orden", "ASC", "id", "ASC"];

const CAMPOS_ORDENABLES = new Set([
    "id", "orden_id", "articulo_id", "lote_id", "descripcion", "estado", "inicial", "realizada_por",
    "dia_inicio", "dia_fin", "tiempo_invertido", "orden", "centro_id", "tipo_proceso_id",
]);

/**
 * El criterio para la API: si se ordena por una columna que no es un campo (p. ej. «Acciones»),
 * el orden por defecto; si se ordena por un campo, se desempata por el orden por defecto.
 */
export const criteriaTareasApi = (criteria: Criteria): Criteria => {
    const [campo, sentido] = criteria.orden;
    const valido = !!campo && CAMPOS_ORDENABLES.has(campo);
    const orden = !valido
        ? ORDEN_TAREAS_DEFECTO
        : criteria.orden.length > 2 ? criteria.orden : [campo, sentido ?? "ASC", ...ORDEN_TAREAS_DEFECTO];
    return { ...criteria, orden };
};

/** Filtro por estados: ninguno o todos, sin filtro. */
export const filtroEstadosTarea = (elegidos: string[]): ClausulaFiltro | null =>
    elegidos.length === 0 || elegidos.length === ESTADOS_TAREA.length
        ? null
        : ["estado", "in", elegidos as unknown as string];

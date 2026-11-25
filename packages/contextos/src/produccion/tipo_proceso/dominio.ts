import { MetaModelo } from "@olula/lib/dominio.ts";
import { comoBooleano, motivoNumeroNoValido, motivoTextoNoValido, primerError, sinTexto } from "../comun/dominio.ts";
import {
    CopiaTipoProceso,
    FormTareaProceso,
    NuevoTipoProceso,
    Secuencia,
    TareaProceso,
    TareaProcesoItem,
    TipoProceso,
    TipoProduccion,
    UnidadTiempo,
} from "./diseño.ts";

/** Longitudes de pr_tiposproceso.mtd y pr_tipostareapro.mtd. */
export const LONGITUD_CODIGO_TIPO_PROCESO = 15;
export const LONGITUD_DESCRIPCION_TIPO_PROCESO = 100;

export const UNIDADES: { valor: UnidadTiempo; descripcion: string }[] = [
    { valor: "Segundos", descripcion: "Segundos" },
    { valor: "Minutos", descripcion: "Minutos" },
    { valor: "Horas", descripcion: "Horas" },
    { valor: "Días", descripcion: "Días" },
];

export const TIPOS_PRODUCCION: { valor: TipoProduccion; descripcion: string }[] = [
    { valor: "Fabricación", descripcion: "Fabricación" },
    { valor: "Modificación", descripcion: "Modificación" },
];

export const validarTipoProceso = (
    t: Pick<NuevoTipoProceso, "id" | "descripcion"> & { tiempoMedio?: number | null },
): string | true =>
    primerError(
        motivoTextoNoValido(t.id, "El código", LONGITUD_CODIGO_TIPO_PROCESO),
        motivoTextoNoValido(t.descripcion, "La descripción", LONGITUD_DESCRIPCION_TIPO_PROCESO),
        motivoNumeroNoValido(t.tiempoMedio, "El tiempo medio"),
    );

const campos = {
    id: { requerido: true },
    descripcion: { requerido: true },
    tiempoMedio: { requerido: false, tipo: "numero" as const },
    unidad: { requerido: true },
    tipoProduccion: { requerido: true },
    generarTodas: { requerido: false, tipo: "checkbox" as const },
    secuencial: { requerido: false, tipo: "checkbox" as const },
    fabricacion: { requerido: false, tipo: "checkbox" as const },
};

export const tipoProcesoVacio = (): TipoProceso => ({
    id: "", descripcion: "", tiempoMedio: null, tiempoUnidad: null, unidad: "Segundos",
    tipoProduccion: "Fabricación", generarTodas: true, secuencial: false, fabricacion: false,
    tareas: [], secuencias: [], completo: true, motivosIncompleto: [],
});

/** Constante estable (no función) para el formulario de alta. */
export const nuevoTipoProcesoVacio: NuevoTipoProceso = {
    id: "", descripcion: "", unidad: "Segundos", tipoProduccion: "Fabricación", fabricacion: true, secuencial: false,
};

export const metaTipoProceso: MetaModelo<TipoProceso> = { campos, validacion: validarTipoProceso };
export const metaNuevoTipoProceso: MetaModelo<NuevoTipoProceso> = { campos, validacion: validarTipoProceso };

// Tareas

export const validarTareaProceso = (t: FormTareaProceso): string | true =>
    primerError(
        sinTexto(t.tipoTareaId) ? "El tipo de tarea es obligatorio" : null,
        motivoTextoNoValido(t.descripcion, "La descripción", LONGITUD_DESCRIPCION_TIPO_PROCESO, false),
        motivoNumeroNoValido(t.orden, "El orden"),
        t.orden !== null && t.orden !== undefined && !Number.isInteger(Number(t.orden))
            ? "El orden ha de ser un número entero" : null,
    );

export const metaFormTareaProceso: MetaModelo<FormTareaProceso> = {
    campos: {
        tipoTareaId: { requerido: true },
        descripcion: { requerido: false },
        orden: { requerido: false, tipo: "entero" },
        inicial: { requerido: false, tipo: "checkbox" },
        final: { requerido: false, tipo: "checkbox" },
        terminaEnUnPaso: { requerido: false, tipo: "checkbox" },
        verificarConsumos: { requerido: false, tipo: "checkbox" },
        opcional: { requerido: false, tipo: "checkbox" },
    },
    validacion: validarTareaProceso,
};

/** Formulario vacío para añadir una tarea (sin orden: la última). */
export const nuevaTareaProcesoVacia = (): FormTareaProceso => ({
    tipoTareaId: "", descripcion: "", orden: null, inicial: false, final: false,
    terminaEnUnPaso: false, verificarConsumos: false, opcional: false,
});

/** Formulario con los datos de una tarea, para cambiarla. */
export const formDesdeTarea = (t: TareaProceso): FormTareaProceso => ({
    tipoTareaId: t.tipoTareaId, descripcion: t.descripcion, orden: t.orden, inicial: t.inicial, final: t.final,
    terminaEnUnPaso: t.terminaEnUnPaso, verificarConsumos: t.verificarConsumos, opcional: t.opcional,
});

/** Marcas de la tarea para la rejilla: "Inicial, Final, Un paso...". */
export const marcasTarea = (t: TareaProceso): string =>
    [
        t.inicial && "Inicial",
        t.final && "Final",
        t.terminaEnUnPaso && "Un paso",
        t.verificarConsumos && "Verifica consumos",
        t.opcional && "Opcional",
    ].filter(Boolean).join(", ");

/** "Código - descripción" de una tarea (o solo la descripción si no tiene código). */
export const nombreTarea = (codigo: string | null | undefined, descripcion: string | null | undefined): string =>
    [codigo, descripcion].filter((s) => !sinTexto(s)).join(" - ");

// Secuencias

/**
 * Motivo por el que no se puede añadir la secuencia de `inicioId` a `finId` (falta alguna, son la
 * misma o ya existe) o `null`. Los ciclos los comprueba el servidor.
 */
export const motivoSecuenciaNoValida = (inicioId: string, finId: string, secuencias: Secuencia[]): string | null => {
    if (!inicioId || !finId) return "Elija la tarea de inicio y la de fin";
    if (inicioId === finId) return "La tarea de inicio y la de fin han de ser distintas";
    if (secuencias.some((s) => s.tareaInicioId === inicioId && s.tareaFinId === finId))
        return "Esa secuencia ya existe";
    return null;
};

/** En un tipo secuencial las secuencias (y las tareas inicial y final) se regeneran solas. */
export const esSecuencial = (t: Pick<TipoProceso, "secuencial">): boolean => comoBooleano(t.secuencial);

// Copia

export const metaCopiaTipoProceso: MetaModelo<CopiaTipoProceso> = {
    campos: { nuevoId: { requerido: true }, descripcion: { requerido: false } },
    validacion: (c) =>
        primerError(
            motivoTextoNoValido(c.nuevoId, "El código nuevo", LONGITUD_CODIGO_TIPO_PROCESO),
            motivoTextoNoValido(c.descripcion, "La descripción", LONGITUD_DESCRIPCION_TIPO_PROCESO, false),
        ),
};

export const copiaTipoProcesoVacia: CopiaTipoProceso = { nuevoId: "", descripcion: "" };

/** Opción de un selector de tareas: «tipo de proceso · código - descripción» (sin el tipo, si ya se sabe). */
export const opcionTareaProceso = (
    t: Pick<TareaProcesoItem, "id" | "tipoProcesoId" | "codigo" | "descripcion">,
    conTipo = true,
): { valor: string; descripcion: string } => ({
    valor: t.id,
    descripcion: conTipo && t.tipoProcesoId
        ? `${t.tipoProcesoId} · ${nombreTarea(t.codigo, t.descripcion)}`
        : nombreTarea(t.codigo, t.descripcion),
});

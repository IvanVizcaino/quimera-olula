import { EstadoEtiqueta } from "#/comun/diseño.ts";
import { MovimientoProduccion } from "./diseño.ts";

/** Píldora del estado del movimiento: PTE (previsto) o HECHO. */
export const etiquetaEstadoMovimiento = (estado: string | null | undefined): EstadoEtiqueta =>
    estado === "HECHO"
        ? { texto: "Hecho", tono: "completado" }
        : estado === "PTE"
            ? { texto: "Pendiente", tono: "pendiente" }
            : { texto: estado || "—", tono: "borrador" };

/** "Entrada" o "Consumo". */
export const textoTipoMovimiento = (tipo: string): string =>
    tipo === "entrada" ? "Entrada" : tipo === "consumo" ? "Consumo" : tipo;

/** Primero la entrada del producto y después los consumos, cada grupo en el orden en que llegan. */
export const ordenarMovimientos = (movimientos: MovimientoProduccion[]): MovimientoProduccion[] => [
    ...movimientos.filter((m) => m.tipo === "entrada"),
    ...movimientos.filter((m) => m.tipo !== "entrada"),
];

/**
 * La tarea del movimiento: la que lo hizo (HECHO) o, si aún está pendiente, la tarea de la orden
 * en la que se consumirá (por su tarea del tipo de proceso). Un consumo sin tarea se hace al
 * terminar la tarea final; la entrada, al terminar el proceso.
 */
export const textoTareaMovimiento = (
    m: Pick<MovimientoProduccion, "tipo" | "tareaId" | "tareaProcesoId">,
    tareas: { id: string; tareaProcesoId: string; descripcion: string }[],
): string => {
    if (m.tareaId) return m.tareaId;
    if (m.tipo === "entrada") return "Al terminar el proceso";
    if (!m.tareaProcesoId) return "En la tarea final";
    const tarea = tareas.find((t) => t.tareaProcesoId === m.tareaProcesoId);
    return tarea ? `En ${tarea.id}${tarea.descripcion ? ` (${tarea.descripcion})` : ""}` : "";
};

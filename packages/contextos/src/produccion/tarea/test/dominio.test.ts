import { describe, expect, it } from "vitest";
import { AccionesCicloVida } from "../../comun/ciclo_vida.ts";
import { EstadoTarea } from "../diseño.ts";
import {
    cabeAccionTarea,
    criteriaTareasApi,
    duracion,
    etiquetaEstadoTarea,
    fechaHora,
    filtroEstadosTarea,
    motivoAccionTarea,
    ORDEN_TAREAS_DEFECTO,
    textoInicialFinal,
    textoTrabajador,
} from "../dominio.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";

const tarea = (estado: EstadoTarea) => ({ estado });

const ciclo = (cabe: Record<string, [boolean, string | null]>, permitido: boolean | null = true): AccionesCicloVida => ({
    estado: "EN_CURSO",
    etiqueta: "En curso",
    acciones: Object.entries(cabe).map(([comando, [c, motivo]]) => ({ comando, cabe: c, condicion: null, motivo, permitido })),
});

describe("tarea de producción: estados y acciones", () => {
    it("cada estado con su color", () => {
        expect(etiquetaEstadoTarea("OFF")).toEqual({ texto: "Inactiva", tono: "borrador" });
        expect(etiquetaEstadoTarea("PTE").tono).toBe("pendiente");
        expect(etiquetaEstadoTarea("EN CURSO").tono).toBe("parcial");
        expect(etiquetaEstadoTarea("EN PAUSA").tono).toBe("error");
        expect(etiquetaEstadoTarea("TERMINADA").tono).toBe("completado");
        expect(etiquetaEstadoTarea("RARO")).toEqual({ texto: "RARO", tono: "borrador" });
    });

    it("sin ciclo de vida leído, decide el estado (como el ciclo de vida del servidor)", () => {
        expect(cabeAccionTarea(tarea("PTE"), null, "iniciar")).toBe(true);
        expect(cabeAccionTarea(tarea("EN PAUSA"), null, "iniciar")).toBe(true);
        expect(cabeAccionTarea(tarea("EN CURSO"), null, "iniciar")).toBe(false);
        expect(cabeAccionTarea(tarea("EN CURSO"), null, "pausar")).toBe(true);
        expect(cabeAccionTarea(tarea("EN CURSO"), null, "terminar")).toBe(true);
        expect(cabeAccionTarea(tarea("PTE"), null, "deshacer")).toBe(false);
        expect(cabeAccionTarea(tarea("TERMINADA"), null, "deshacer")).toBe(true);
        for (const accion of ["iniciar", "pausar", "terminar", "deshacer"] as const)
            expect(cabeAccionTarea(tarea("OFF"), null, accion)).toBe(false);
    });

    it("con ciclo de vida, manda él y su motivo", () => {
        const acciones = ciclo({
            "produccion.tarea.iniciar": [false, "La tarea está En curso"],
            "produccion.tarea.terminar": [true, null],
        });
        expect(cabeAccionTarea(tarea("PTE"), acciones, "iniciar")).toBe(false);
        expect(motivoAccionTarea(tarea("PTE"), acciones, "iniciar")).toBe("La tarea está En curso");
        expect(motivoAccionTarea(tarea("EN CURSO"), acciones, "terminar")).toBeUndefined();
        // Sin la acción en el ciclo de vida, el motivo por el estado.
        expect(motivoAccionTarea(tarea("PTE"), acciones, "pausar")).toBe("No se puede pausar una tarea pendiente");
        expect(motivoAccionTarea(tarea("EN CURSO"), ciclo({ "produccion.tarea.pausar": [true, null] }, false), "pausar"))
            .toBe("No tiene permiso para esta acción");
    });
});

describe("tarea de producción: formato", () => {
    it("fecha y hora en dd/mm/aaaa HH:MM", () => {
        expect(fechaHora("2026-11-24", "09:05:33")).toBe("24/11/2026 09:05");
        expect(fechaHora("2026-11-24", "")).toBe("24/11/2026");
        expect(fechaHora("", "09:05:33")).toBe("");
    });

    it("duración en h:mm:ss", () => {
        expect(duracion(3725)).toBe("1:02:05");
        expect(duracion(59.6)).toBe("0:01:00");
        expect(duracion(null)).toBe("");
    });

    it("trabajador e inicial/final", () => {
        expect(textoTrabajador({ realizadaPor: "T01", trabajador: "Ana" })).toBe("T01 - Ana");
        expect(textoTrabajador({ realizadaPor: "T01", trabajador: "" })).toBe("T01");
        expect(textoTrabajador({ realizadaPor: "", trabajador: "" })).toBe("");
        expect(textoInicialFinal({ inicial: true, final: true })).toBe("Inicial y final");
        expect(textoInicialFinal({ inicial: false, final: true })).toBe("Final");
        expect(textoInicialFinal({ inicial: false, final: false })).toBe("");
    });
});

describe("tarea de producción: lista", () => {
    it("filtro de estados: ninguno o todos, sin filtro", () => {
        expect(filtroEstadosTarea([])).toBeNull();
        expect(filtroEstadosTarea(["OFF", "PTE", "EN CURSO", "EN PAUSA", "TERMINADA"])).toBeNull();
        expect(filtroEstadosTarea(["PTE", "EN CURSO"])).toEqual(["estado", "in", ["PTE", "EN CURSO"]]);
    });

    it("orden: por defecto si la columna no es un campo; si lo es, desempata con el de defecto", () => {
        expect(criteriaTareasApi({ ...criteriaDefecto, orden: ["acciones", "ASC"] }).orden).toEqual(ORDEN_TAREAS_DEFECTO);
        expect(criteriaTareasApi({ ...criteriaDefecto, orden: [] }).orden).toEqual(ORDEN_TAREAS_DEFECTO);
        expect(criteriaTareasApi({ ...criteriaDefecto, orden: ["dia_inicio", "DESC"] }).orden)
            .toEqual(["dia_inicio", "DESC", ...ORDEN_TAREAS_DEFECTO]);
        expect(criteriaTareasApi({ ...criteriaDefecto, orden: ORDEN_TAREAS_DEFECTO }).orden).toEqual(ORDEN_TAREAS_DEFECTO);
    });
});

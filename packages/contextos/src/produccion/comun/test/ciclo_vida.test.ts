import { describe, expect, it } from "vitest";
import { accionesCicloVidaDesdeApi, cabeAccion, motivoAccion } from "../ciclo_vida.ts";

const acciones = accionesCicloVidaDesdeApi({
    estado: "EN_CURSO",
    etiqueta: "En curso",
    acciones: [
        { comando: "x.borrar", cabe: false, motivo: "La orden no está pendiente", permitido: true },
        { comando: "x.cambiar", cabe: true, condicion: "salvo si solo cambia descripcion", permitido: null },
        { comando: "x.quitar", cabe: true, permitido: false },
    ],
});

describe("ciclo de vida", () => {
    it("lee las acciones (lo que falta es null)", () => {
        expect(acciones.acciones[1]).toEqual({
            comando: "x.cambiar", cabe: true, condicion: "salvo si solo cambia descripcion", motivo: null, permitido: null,
        });
    });

    it("cabe si cabe en el estado y no se ha negado el permiso", () => {
        expect(cabeAccion(acciones, "x.borrar")).toBe(false);
        expect(cabeAccion(acciones, "x.cambiar")).toBe(true);
        expect(cabeAccion(acciones, "x.quitar")).toBe(false);
    });

    it("sin acciones o sin el comando decide el valor por defecto", () => {
        expect(cabeAccion(null, "x.borrar", true)).toBe(true);
        expect(cabeAccion(acciones, "x.otro")).toBe(false);
    });

    it("motivo para el botón deshabilitado", () => {
        expect(motivoAccion(acciones, "x.borrar")).toBe("La orden no está pendiente");
        expect(motivoAccion(acciones, "x.quitar")).toBe("No tiene permiso para esta acción");
        expect(motivoAccion(acciones, "x.cambiar")).toBeUndefined();
    });
});

import { describe, expect, it } from "vitest";
import { descripcionCaraUbicacion, nuevaUbicacionVacia, validarPosicionUbicacion } from "../dominio.ts";

describe("validarPosicionUbicacion", () => {
    it("sin pasillo exige código", () => {
        expect(validarPosicionUbicacion({ ...nuevaUbicacionVacia, codigo: "MUELLE" })).toBe(true);
        expect(validarPosicionUbicacion({ ...nuevaUbicacionVacia, codigo: "  " })).not.toBe(true);
    });

    it("con pasillo el código puede quedar vacío si hay módulo, nivel y hueco", () => {
        expect(
            validarPosicionUbicacion({ ...nuevaUbicacionVacia, pasilloId: "3", modulo: 7, nivel: 0, hueco: 1 })
        ).toBe(true);
    });

    it("con pasillo exige módulo > 0, nivel >= 0 y hueco >= 1", () => {
        const base = { ...nuevaUbicacionVacia, pasilloId: "3", modulo: 1, nivel: 0, hueco: 1 };
        expect(validarPosicionUbicacion({ ...base, modulo: null })).not.toBe(true);
        expect(validarPosicionUbicacion({ ...base, modulo: 0 })).not.toBe(true);
        expect(validarPosicionUbicacion({ ...base, nivel: null })).not.toBe(true);
        expect(validarPosicionUbicacion({ ...base, nivel: -1 })).not.toBe(true);
        expect(validarPosicionUbicacion({ ...base, hueco: 0 })).not.toBe(true);
    });
});

describe("descripcionCaraUbicacion", () => {
    it("traduce la cara", () => {
        expect(descripcionCaraUbicacion("IZQUIERDA")).toBe("Izquierda");
        expect(descripcionCaraUbicacion("DERECHA")).toBe("Derecha");
        expect(descripcionCaraUbicacion(null)).toBe("");
    });
});

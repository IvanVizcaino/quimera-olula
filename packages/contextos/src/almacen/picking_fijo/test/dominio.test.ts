import { describe, expect, it } from "vitest";
import { nuevoPickingFijoVacio, validarNuevoPickingFijo, validarReposicionPickingFijo } from "../dominio.ts";

const valida = { minimo: 10, maximo: 60, unidadReposicion: 12 };

describe("validarReposicionPickingFijo", () => {
    it("acepta valores correctos", () => {
        expect(validarReposicionPickingFijo(valida)).toBe(true);
    });

    it("rechaza mínimo negativo y acepta 0", () => {
        expect(validarReposicionPickingFijo({ ...valida, minimo: -1 })).not.toBe(true);
        expect(validarReposicionPickingFijo({ ...valida, minimo: 0 })).toBe(true);
    });

    it("exige máximo mayor que mínimo", () => {
        expect(validarReposicionPickingFijo({ ...valida, maximo: 10 })).not.toBe(true);
        expect(validarReposicionPickingFijo({ ...valida, maximo: 5 })).not.toBe(true);
    });

    it("exige unidad positiva", () => {
        expect(validarReposicionPickingFijo({ ...valida, unidadReposicion: 0 })).not.toBe(true);
    });

    it("exige unidad no mayor que máximo menos mínimo", () => {
        expect(validarReposicionPickingFijo({ ...valida, unidadReposicion: 50 })).toBe(true);
        expect(validarReposicionPickingFijo({ ...valida, unidadReposicion: 51 })).not.toBe(true);
    });

    it("rechaza valores no numéricos", () => {
        expect(validarReposicionPickingFijo({ ...valida, minimo: NaN })).not.toBe(true);
    });
});

describe("validarNuevoPickingFijo", () => {
    const nuevo = { ...nuevoPickingFijoVacio, ...valida, articuloId: "REF1", ubicacionId: "17" };

    it("acepta un alta completa", () => {
        expect(validarNuevoPickingFijo(nuevo)).toBe(true);
    });

    it("exige artículo y ubicación", () => {
        expect(validarNuevoPickingFijo({ ...nuevo, articuloId: "" })).not.toBe(true);
        expect(validarNuevoPickingFijo({ ...nuevo, ubicacionId: " " })).not.toBe(true);
        expect(validarNuevoPickingFijo({ ...nuevo, articuloId: null as unknown as string })).not.toBe(true);
    });
});

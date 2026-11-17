import { describe, expect, it } from "vitest";
import { NecesidadReposicion, Reposicion } from "../diseño.ts";
import { calcularDisponible, puedeGenerarTraspaso, textoOrigenes, totalOrigenes } from "../dominio.ts";

const necesidad: NecesidadReposicion = {
    pickingFijoId: "1",
    articuloId: "REF1",
    ubicacionId: "17",
    ubicacion: "PIC-A-03-1-1",
    minimo: 10,
    maximo: 60,
    unidadReposicion: 12,
    fisico: 22,
    entrante: 0,
    saliente: 15,
    disponible: 7,
    cantidad: 48,
    falta: 0,
    origenes: [
        { ubicacionId: "40", ubicacion: "APQ-B-07-2-3", cantidad: 36 },
        { ubicacionId: "41", ubicacion: "APQ-B-07-2-4", cantidad: 12 },
    ],
};

describe("reposición", () => {
    it("calcula el disponible", () => {
        expect(calcularDisponible(necesidad)).toBe(7);
        expect(calcularDisponible({ fisico: 5, entrante: 10, saliente: 0 })).toBe(15);
    });

    it("suma y describe los orígenes", () => {
        expect(totalOrigenes(necesidad)).toBe(48);
        expect(textoOrigenes(necesidad)).toBe("APQ-B-07-2-3 (36), APQ-B-07-2-4 (12)");
        expect(totalOrigenes({ origenes: [] })).toBe(0);
    });

    it("solo permite generar si hay origen y no se ha creado orden", () => {
        const r: Reposicion = { ordenId: null, necesidades: [necesidad] };
        expect(puedeGenerarTraspaso(r)).toBe(true);
        expect(puedeGenerarTraspaso({ ...r, ordenId: "T1" })).toBe(false);
        expect(puedeGenerarTraspaso({ ordenId: null, necesidades: [{ ...necesidad, origenes: [] }] })).toBe(false);
        expect(puedeGenerarTraspaso({ ordenId: null, necesidades: [] })).toBe(false);
    });
});

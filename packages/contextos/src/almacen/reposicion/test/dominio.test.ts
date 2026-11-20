import { describe, expect, it } from "vitest";
import { NecesidadReposicion, Reposicion } from "../diseño.ts";
import {
    calcularDisponible, marcarNecesidad, puedeGenerarSeleccion, puedeGenerarTraspaso, seleccionInicial,
    situacion, textoArticulo, textoOrigenes, todasSeleccionadas, totalOrigenes,
} from "../dominio.ts";

const necesidad: NecesidadReposicion = {
    pickingFijoId: "1",
    articuloId: "REF1",
    descripcion: "Tornillo",
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

    it("describe el artículo con referencia y descripción", () => {
        expect(textoArticulo(necesidad)).toBe("REF1 - Tornillo");
        expect(textoArticulo({ articuloId: "REF2", descripcion: "" })).toBe("REF2");
    });

    it("la situación lleva físico, entrante y saliente aunque sean cero", () => {
        expect(situacion(necesidad)).toEqual([
            { tipo: "fisico", cantidad: 22 },
            { tipo: "entrante", cantidad: 0 },
            { tipo: "saliente", cantidad: 15 },
        ]);
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

    describe("selección", () => {
        const sinOrigen = { ...necesidad, pickingFijoId: "2", origenes: [] };
        const otra = { ...necesidad, pickingFijoId: "3" };
        const r: Reposicion = { ordenId: null, necesidades: [necesidad, sinOrigen, otra] };

        it("marca de inicio las que tienen origen", () => {
            expect(seleccionInicial(r)).toEqual(["1", "3"]);
        });

        it("sabe si están todas marcadas", () => {
            expect(todasSeleccionadas(r, ["1", "3"])).toBe(true);
            expect(todasSeleccionadas(r, ["1"])).toBe(false);
            expect(todasSeleccionadas({ ordenId: null, necesidades: [sinOrigen] }, [])).toBe(false);
        });

        it("marca y desmarca sin duplicar", () => {
            expect(marcarNecesidad(["1"], "1", true)).toEqual(["1"]);
            expect(marcarNecesidad(["1"], "3", true)).toEqual(["1", "3"]);
            expect(marcarNecesidad(["1", "3"], "1", false)).toEqual(["3"]);
        });

        it("solo genera con alguna marcada con origen", () => {
            expect(puedeGenerarSeleccion(r, ["3"])).toBe(true);
            expect(puedeGenerarSeleccion(r, [])).toBe(false);
            expect(puedeGenerarSeleccion(r, ["2"])).toBe(false);
            expect(puedeGenerarSeleccion({ ...r, ordenId: "T1" }, ["1"])).toBe(false);
        });
    });
});

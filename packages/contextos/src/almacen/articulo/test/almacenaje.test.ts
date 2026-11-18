import { describe, expect, it } from "vitest";
import { Articulo } from "../diseño.ts";
import { articuloVacio, cambiosArticulo, dimensionValida } from "../detalle/dominio.ts";

describe("dimensionValida", () => {
    it("acepta vacío y cero", () => {
        expect(dimensionValida(null)).toBe(true);
        expect(dimensionValida(0)).toBe(true);
        expect(dimensionValida(1.25)).toBe(true);
    });

    it("rechaza negativos y no finitos", () => {
        expect(dimensionValida(-0.1)).toBe(false);
        expect(dimensionValida(NaN)).toBe(false);
        expect(dimensionValida(Infinity)).toBe(false);
    });
});

describe("cambiosArticulo con datos de almacenaje", () => {
    const base: Articulo = articuloVacio();

    it("sin cambios no envía nada", () => {
        expect(cambiosArticulo(base, { ...base })).toEqual({});
    });

    it("envía solo los campos de almacenaje que cambian", () => {
        const nuevo: Articulo = { ...base, claseAlmacenamientoId: "3", largo: 1.2 };
        expect(cambiosArticulo(base, nuevo)).toEqual({ claseAlmacenamientoId: "3", largo: 1.2 });
    });

    it("permite vaciar una dimensión", () => {
        const con: Articulo = { ...base, alto: 0.5 };
        expect(cambiosArticulo(con, { ...con, alto: null })).toEqual({ alto: null });
    });
});

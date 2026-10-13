import { describe, expect, test } from "vitest";
import {
    anadirArticulo,
    formRegenerarVacio,
    MENSAJE_ALMACEN_NO_EXISTE,
    MENSAJE_SIN_FILTRO,
    peticionDesdeForm,
    validarRegeneracion,
} from "../dominio.ts";

describe("regenera_movimientos dominio (Eneboo acRegeneraMovimientos)", () => {
    test("sin almacén: «El almacén no existe» (se valida antes que el filtro)", () => {
        expect(validarRegeneracion(formRegenerarVacio())).toBe(MENSAJE_ALMACEN_NO_EXISTE);
    });

    test("sin artículos ni familia: «Debe indicar un filtro»", () => {
        expect(validarRegeneracion({ ...formRegenerarVacio(), almacenId: "ALG" })).toBe(MENSAJE_SIN_FILTRO);
    });

    test("válido con artículos o con familia", () => {
        expect(validarRegeneracion({ almacenId: "ALG", articulos: ["A"], familiaId: "" })).toBeNull();
        expect(validarRegeneracion({ almacenId: "ALG", articulos: [], familiaId: "CAFE" })).toBeNull();
    });

    test("petición omite filtros vacíos", () => {
        expect(peticionDesdeForm({ almacenId: "ALG", articulos: ["A", "B"], familiaId: "" })).toEqual({
            almacenId: "ALG",
            articulos: ["A", "B"],
        });
        expect(peticionDesdeForm({ almacenId: "ALG", articulos: [], familiaId: "F" })).toEqual({
            almacenId: "ALG",
            familiaId: "F",
        });
    });

    test("anadirArticulo evita duplicados y vacíos", () => {
        expect(anadirArticulo(["A"], "B")).toEqual(["A", "B"]);
        expect(anadirArticulo(["A"], "A")).toEqual(["A"]);
        expect(anadirArticulo(["A"], "  ")).toEqual(["A"]);
    });
});

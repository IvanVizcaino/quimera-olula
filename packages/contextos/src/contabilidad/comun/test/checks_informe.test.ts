import { describe, expect, test } from "vitest";
import {
    aBooleano,
    camposCheck,
    checksNormalizados,
    conChecks,
} from "../checks_informe.ts";

describe("aBooleano", () => {
    test("acepta los valores que deja una casilla en useModelo", () => {
        expect(aBooleano(true)).toBe(true);
        expect(aBooleano("true")).toBe(true);
        expect(aBooleano("1")).toBe(true);
        expect(aBooleano(false)).toBe(false);
        expect(aBooleano("false")).toBe(false);
        expect(aBooleano("")).toBe(false);
        expect(aBooleano(null)).toBe(false);
    });
});

describe("camposCheck", () => {
    test("declara cada campo como casilla", () => {
        expect(camposCheck(["datosIva", "agruparMeses"])).toEqual({
            datosIva: { tipo: "checkbox" },
            agruparMeses: { tipo: "checkbox" },
        });
    });
});

describe("checksNormalizados", () => {
    test("convierte a booleano las casillas que llegan como texto", () => {
        const modelo = { a: "true", b: "false", c: "texto" };
        expect(checksNormalizados(modelo, ["a", "b"])).toEqual({
            a: true,
            b: false,
            c: "texto",
        });
    });

    test("devuelve el mismo objeto si ya son booleanos", () => {
        const modelo = { a: true, b: false };
        expect(checksNormalizados(modelo, ["a", "b", "noExiste"])).toBe(modelo);
    });
});

describe("conChecks", () => {
    const meta = conChecks<Record<string, unknown>>(
        { campos: { descripcion: { requerido: true } } },
        ["todos", "conIva"],
        (m) => (m.todos ? { ...m, porcentaje: 0 } : m)
    );

    test("añade el tipo checkbox sin perder el resto de campos", () => {
        expect(meta.campos?.todos).toEqual({ tipo: "checkbox" });
        expect(meta.campos?.conIva).toEqual({ tipo: "checkbox" });
        expect(meta.campos?.descripcion).toEqual({ requerido: true });
    });

    test("normaliza las casillas y después aplica las reglas", () => {
        const resultado = meta.onChange?.(
            { todos: "true", conIva: "false", porcentaje: 21 },
            "todos",
            false
        );
        expect(resultado).toEqual({ todos: true, conIva: false, porcentaje: 0 });
    });
});

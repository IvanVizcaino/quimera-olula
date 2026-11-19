import { describe, expect, test } from "vitest";
import { cambiosCodigoBalance } from "../detalle/detalle.ts";
import {
    codigoBalanceVacio,
    criteriaCuentasDeCodigo,
    descripcionCodigoBalance,
    etiquetaCodigoBalance,
    nivel2Valido,
} from "../dominio.ts";

describe("dominio de códigos de balance", () => {
    test("la etiqueta usa la descripción del nivel más concreto", () => {
        const codigo = {
            ...codigoBalanceVacio(),
            id: "P-A-1-VII-",
            descripcion1: "A) PATRIMONIO NETO",
            descripcion3: "VII. Resultado del ejercicio.",
        };
        expect(descripcionCodigoBalance(codigo)).toBe("VII. Resultado del ejercicio.");
        expect(etiquetaCodigoBalance(codigo)).toBe("P-A-1-VII- — VII. Resultado del ejercicio.");
    });

    test("nivel2 vacío o numérico", () => {
        expect(nivel2Valido("")).toBe(true);
        expect(nivel2Valido("12")).toBe(true);
        expect(nivel2Valido("A")).toBe(false);
    });

    test("las cuentas se piden filtradas por código y ordenadas por cuenta", () => {
        const criteria = criteriaCuentasDeCodigo("A-A--I-1");
        expect(criteria.filtro).toEqual([["codigo_balance_id", "=", "A-A--I-1"]]);
        expect(criteria.orden).toEqual(["codigo_cuenta", "ASC"]);
    });

    test("cambiosCodigoBalance solo devuelve lo modificado", () => {
        const previo = { ...codigoBalanceVacio(), id: "X", descripcion4: "a" };
        expect(cambiosCodigoBalance(previo, { ...previo, descripcion4: "b", nivel2: "3" }))
            .toEqual({ descripcion4: "b", nivel2: "3" });
        expect(cambiosCodigoBalance(previo, previo)).toEqual({});
    });
});

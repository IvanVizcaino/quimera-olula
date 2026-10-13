import { describe, expect, test } from "vitest";
import {
    asientoCuadrado,
    descuadrePartidas,
    ejercicioIdEnCriteria,
    ejercicioIdParaRenumerar,
    totalDebe,
    totalHaber,
} from "../dominio.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";

describe("dominio asiento manual", () => {
    test("totalDebe y totalHaber suman partidas", () => {
        const partidas = [
            { debe: 100, haber: 0 },
            { debe: 0, haber: 100 },
        ];
        expect(totalDebe(partidas)).toBe(100);
        expect(totalHaber(partidas)).toBe(100);
        expect(descuadrePartidas(partidas)).toBe(0);
        expect(asientoCuadrado(partidas)).toBe(true);
    });

    test("ejercicioIdEnCriteria lee filtro eq del listado", () => {
        expect(
            ejercicioIdEnCriteria({
                ...criteriaDefecto,
                filtro: [["ejercicio_id", "eq", "2025"]],
            })
        ).toBe("2025");
        expect(ejercicioIdParaRenumerar({ ...criteriaDefecto, filtro: [] })).toMatch(/^\d{4}$/);
    });

    test("detecta descuadre", () => {
        const partidas = [
            { debe: 100, haber: 0 },
            { debe: 0, haber: 50 },
        ];
        expect(asientoCuadrado(partidas)).toBe(false);
        expect(descuadrePartidas(partidas)).toBe(50);
    });
});

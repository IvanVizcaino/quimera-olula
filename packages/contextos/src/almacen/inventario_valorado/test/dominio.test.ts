import { describe, expect, test } from "vitest";
import { criteriaInventarioValorado } from "../dominio.ts";

describe("criteriaInventarioValorado (T5.5)", () => {
    test("sin filtros devuelve criteria vacío", () => {
        const c = criteriaInventarioValorado({});
        expect(c.filtro).toEqual([]);
    });

    test("excluir obsoletos solo viaja si se pide (R4, nace desmarcado)", () => {
        expect(criteriaInventarioValorado({}).filtro).toEqual([]);
        expect(criteriaInventarioValorado({ excluirObsoletos: false }).filtro).toEqual([]);
        expect(criteriaInventarioValorado({ excluirObsoletos: true }).filtro).toEqual([
            ["excluir_obsoletos", "eq", "true"],
        ]);
    });

    test("almacén y referencia en filtro", () => {
        const c = criteriaInventarioValorado({ almacenId: "ALM1", referencia: "REF-01" });
        expect(c.filtro).toEqual([
            ["almacen_id", "eq", "ALM1"],
            ["referencia", "eq", "REF-01"],
        ]);
    });
});

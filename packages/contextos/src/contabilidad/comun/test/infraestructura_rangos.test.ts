import { Criteria } from "@olula/lib/diseño.ts";
import { describe, expect, test, vi } from "vitest";

const getAsientos = vi.fn(async (criteria: Criteria) => ({
    datos: [{ numero: criteria.orden[1] === "ASC" ? 1 : 4820 }],
    total: 4820,
}));
const getSubcuentas = vi.fn(async (criteria: Criteria) => ({
    datos:
        criteria.filtro && JSON.stringify(criteria.filtro).includes("2099")
            ? []
            : [{ codigo: criteria.orden[1] === "ASC" ? "1000000000" : "7790000000" }],
    total: 0,
}));

vi.mock("#/contabilidad/asiento/infraestructura.ts", () => ({ getAsientos }));
vi.mock("#/contabilidad/subcuenta/infraestructura.ts", () => ({
    getSubcuentas,
}));

const { getExtremosAsientos, getExtremosSubcuentas } = await import(
    "../infraestructura_rangos.ts"
);

describe("extremos del ejercicio", () => {
    test("primer y último asiento por número", async () => {
        expect(await getExtremosAsientos("2026")).toEqual(["1", "4820"]);
        const ordenes = getAsientos.mock.calls.map(([c]) => c.orden);
        expect(ordenes).toEqual([
            ["numero", "ASC"],
            ["numero", "DESC"],
        ]);
    });

    test("primera y última subcuenta por código", async () => {
        expect(await getExtremosSubcuentas("2026")).toEqual([
            "1000000000",
            "7790000000",
        ]);
    });

    test("sin subcuentas en el ejercicio no hay extremos", async () => {
        expect(await getExtremosSubcuentas("2099")).toBeNull();
    });
});

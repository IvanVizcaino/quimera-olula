import { describe, expect, test } from "vitest";
import { nuevaSubcuentaAApi } from "../infraestructura.ts";
import { criteriaConEjercicio, ejercicioIdDesdeCriteria } from "../maestro/dominio.ts";

describe("subcuenta maestro dominio (D2 F-01)", () => {
    test("criteriaConEjercicio fija filtro ejercicio_id", () => {
        const c = criteriaConEjercicio("2026");
        expect(c.filtro).toEqual([["ejercicio_id", "eq", "2026"]]);
        expect(c.orden).toEqual(["codigo", "ASC"]);
    });

    test("ejercicioIdDesdeCriteria lee eq", () => {
        expect(
            ejercicioIdDesdeCriteria({
                filtro: [["ejercicio_id", "eq", "2025"]],
                orden: ["codigo", "ASC"],
                paginacion: { pagina: 1, limite: 20 },
            }),
        ).toBe("2025");
    });

    test("nuevaSubcuentaAApi snake_case", () => {
        expect(
            nuevaSubcuentaAApi({
                codigo: "4300001",
                nombre: "X",
                codigoCuenta: "430",
                ejercicioId: "2026",
                impuestoId: "",
            }),
        ).toEqual({
            codigo: "4300001",
            nombre: "X",
            codigo_cuenta: "430",
            ejercicio_id: "2026",
        });
    });

    test("nuevaSubcuentaAApi incluye impuesto_id si hay valor", () => {
        expect(
            nuevaSubcuentaAApi({
                codigo: "4300001",
                nombre: "X",
                codigoCuenta: "430",
                ejercicioId: "2026",
                impuestoId: "GEN",
            }),
        ).toEqual({
            codigo: "4300001",
            nombre: "X",
            codigo_cuenta: "430",
            ejercicio_id: "2026",
            impuesto_id: "GEN",
        });
    });
});

import { describe, expect, test } from "vitest";
import { ejercicioActual, ejercicioIdEnCriteria } from "#/contabilidad/asiento/dominio.ts";
import { nuevaSubcuentaAApi } from "../infraestructura.ts";
import { etiquetaSubcuenta } from "../dominio.ts";
import { criteriaSubcuentasDefecto, metaFiltroSubcuenta } from "../maestro/diseño.ts";

describe("subcuenta maestro", () => {
    test("el criteria por defecto filtra por el ejercicio actual", () => {
        const criteria = criteriaSubcuentasDefecto();

        expect(ejercicioIdEnCriteria(criteria)).toBe(ejercicioActual());
        expect(criteria.orden).toEqual(["codigo", "ASC"]);
    });

    test("el filtro de ejercicio usa el nombre de campo de la API", () => {
        expect(metaFiltroSubcuenta.ejercicioId.campo).toBe("ejercicio_id");
        expect(metaFiltroSubcuenta.ejercicioId.filtro("2025")).toEqual([
            "ejercicio_id",
            "eq",
            "2025",
        ]);
    });
});

describe("subcuenta dominio", () => {
    test("etiquetaSubcuenta usa código y descripción", () => {
        expect(etiquetaSubcuenta({ codigo: "430", nombre: "CLIENTES" }))
            .toBe("430 — CLIENTES");
        expect(etiquetaSubcuenta({ codigo: "430", nombre: "" })).toBe("430");
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

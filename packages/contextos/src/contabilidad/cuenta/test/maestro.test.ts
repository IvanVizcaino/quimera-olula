import { describe, expect, test } from "vitest";
import { criteriaCuentasDefecto, metaFiltroCuenta } from "../maestro/diseño.ts";
import { ejercicioActual, ejercicioIdEnCriteria } from "#/contabilidad/asiento/dominio.ts";

describe("maestro de cuentas", () => {
    test("el criteria por defecto filtra por el ejercicio actual", () => {
        const criteria = criteriaCuentasDefecto();

        expect(ejercicioIdEnCriteria(criteria)).toBe(ejercicioActual());
        expect(criteria.orden).toEqual(["codigo", "ASC"]);
    });

    test("el filtro de ejercicio usa el nombre de campo de la API", () => {
        expect(metaFiltroCuenta.ejercicioId.campo).toBe("ejercicio_id");
        expect(metaFiltroCuenta.ejercicioId.filtro("2024")).toEqual([
            "ejercicio_id",
            "eq",
            "2024",
        ]);
    });

    test("un filtro vacío no genera cláusula", () => {
        expect(metaFiltroCuenta.ejercicioId.filtro("")).toBeNull();
        expect(metaFiltroCuenta.codigo.filtro(undefined)).toBeNull();
    });
});

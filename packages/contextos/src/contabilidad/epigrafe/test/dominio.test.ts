import { describe, expect, test } from "vitest";
import { ejercicioActual, ejercicioIdEnCriteria } from "#/contabilidad/asiento/dominio.ts";
import { etiquetaEpigrafe } from "../dominio.ts";
import {
    criteriaEpigrafesDefecto,
    metaFiltroEpigrafe,
} from "../maestro/diseño.ts";

describe("epígrafe dominio", () => {
    test("la etiqueta usa código y descripción", () => {
        expect(etiquetaEpigrafe({ codigo: "40", descripcion: "PROVEEDORES" }))
            .toBe("40 — PROVEEDORES");
        expect(etiquetaEpigrafe({ codigo: "40", descripcion: "" })).toBe("40");
    });
});

describe("maestro de subgrupos", () => {
    test("el criteria por defecto filtra por el ejercicio actual", () => {
        const criteria = criteriaEpigrafesDefecto();

        expect(ejercicioIdEnCriteria(criteria)).toBe(ejercicioActual());
        expect(criteria.orden).toEqual(["codigo", "ASC"]);
    });

    test("el filtro de ejercicio usa el nombre de campo de la API", () => {
        expect(metaFiltroEpigrafe.ejercicioId.campo).toBe("ejercicio_id");
        expect(metaFiltroEpigrafe.ejercicioId.filtro("2024")).toEqual([
            "ejercicio_id",
            "eq",
            "2024",
        ]);
    });
});

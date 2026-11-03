import { describe, expect, test } from "vitest";
import { ejercicioActual, ejercicioIdEnCriteria } from "#/contabilidad/asiento/dominio.ts";
import { etiquetaGrupoEpigrafe } from "../dominio.ts";
import {
    criteriaGruposEpigrafesDefecto,
    metaFiltroGrupoEpigrafe,
} from "../maestro/diseño.ts";

describe("grupo de epígrafes dominio", () => {
    test("la etiqueta usa código y descripción", () => {
        expect(etiquetaGrupoEpigrafe({ codigo: "4", descripcion: "ACREEDORES" }))
            .toBe("4 — ACREEDORES");
        expect(etiquetaGrupoEpigrafe({ codigo: "4", descripcion: "" }))
            .toBe("4");
    });
});

describe("maestro de grupos de epígrafes", () => {
    test("el criteria por defecto filtra por el ejercicio actual", () => {
        const criteria = criteriaGruposEpigrafesDefecto();

        expect(ejercicioIdEnCriteria(criteria)).toBe(ejercicioActual());
        expect(criteria.orden).toEqual(["codigo", "ASC"]);
    });

    test("el filtro de ejercicio usa el nombre de campo de la API", () => {
        expect(metaFiltroGrupoEpigrafe.ejercicioId.campo).toBe("ejercicio_id");
        expect(metaFiltroGrupoEpigrafe.ejercicioId.filtro("2024")).toEqual([
            "ejercicio_id",
            "eq",
            "2024",
        ]);
    });
});

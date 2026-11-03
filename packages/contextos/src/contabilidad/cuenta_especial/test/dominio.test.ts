import { describe, expect, test } from "vitest";
import { etiquetaCuentaEspecial } from "../dominio.ts";
import {
    criteriaCuentasEspecialesDefecto,
    metaFiltroCuentaEspecial,
} from "../maestro/diseño.ts";

describe("cuenta especial dominio", () => {
    test("la etiqueta usa código y descripción", () => {
        expect(etiquetaCuentaEspecial({ id: "IVASOP", descripcion: "IVA SOP" }))
            .toBe("IVASOP — IVA SOP");
        expect(etiquetaCuentaEspecial({ id: "IVASOP", descripcion: "" }))
            .toBe("IVASOP");
    });
});

describe("maestro de cuentas especiales", () => {
    test("el criteria por defecto ordena por código y no filtra", () => {
        const criteria = criteriaCuentasEspecialesDefecto();

        expect(criteria.filtro).toEqual([]);
        expect(criteria.orden).toEqual(["id", "ASC"]);
    });

    test("los filtros usan el nombre de campo de la API", () => {
        expect(metaFiltroCuentaEspecial.id.filtro("IVA")).toEqual([
            "id",
            "~",
            "IVA",
        ]);
        expect(metaFiltroCuentaEspecial.descripcion.filtro("")).toBeNull();
    });
});

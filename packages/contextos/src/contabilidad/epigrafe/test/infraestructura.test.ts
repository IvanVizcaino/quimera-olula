import { describe, expect, test } from "vitest";
import {
    cambiosEpigrafeAApi,
    epigrafeDesdeApi,
    nuevoEpigrafeAApi,
} from "../infraestructura.ts";

describe("epígrafe infraestructura (co_epigrafes)", () => {
    test("epigrafeDesdeApi mapea snake_case a dominio", () => {
        expect(
            epigrafeDesdeApi({
                id: 12,
                codigo: "40",
                descripcion: "PROVEEDORES",
                ejercicio_id: "2026",
                grupo_id: 3,
                codigo_grupo: "4",
                padre_id: null,
            }),
        ).toEqual({
            id: "12",
            codigo: "40",
            descripcion: "PROVEEDORES",
            ejercicioId: "2026",
            grupoId: "3",
            codigoGrupo: "4",
            padreId: "",
        });
    });

    test("epigrafeDesdeApi deja vacíos los enlaces sin valor", () => {
        expect(
            epigrafeDesdeApi({
                id: 1,
                codigo: "40",
                descripcion: "X",
                ejercicio_id: "2026",
                grupo_id: null,
                codigo_grupo: null,
                padre_id: null,
            }),
        ).toMatchObject({ grupoId: "", codigoGrupo: "", padreId: "" });
    });

    test("nuevoEpigrafeAApi manda el grupo como número y lo omite si va vacío", () => {
        expect(
            nuevoEpigrafeAApi({
                codigo: "40",
                descripcion: "PROVEEDORES",
                ejercicioId: "2026",
                grupoId: "3",
            }),
        ).toEqual({
            codigo: "40",
            descripcion: "PROVEEDORES",
            ejercicio_id: "2026",
            grupo_id: 3,
        });

        expect(
            nuevoEpigrafeAApi({
                codigo: "40",
                descripcion: "PROVEEDORES",
                ejercicioId: "2026",
                grupoId: "",
            }),
        ).toEqual({
            codigo: "40",
            descripcion: "PROVEEDORES",
            ejercicio_id: "2026",
        });
    });

    test("cambiosEpigrafeAApi manda null al desvincular el grupo", () => {
        expect(cambiosEpigrafeAApi({ codigo: "41" })).toEqual({ codigo: "41" });
        expect(cambiosEpigrafeAApi({ grupoId: "" }))
            .toEqual({ grupo_id: null });
        expect(cambiosEpigrafeAApi({ grupoId: "5" }))
            .toEqual({ grupo_id: 5 });
        expect(cambiosEpigrafeAApi({})).toEqual({});
    });
});

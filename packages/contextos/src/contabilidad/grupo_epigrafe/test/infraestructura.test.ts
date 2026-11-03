import { describe, expect, test } from "vitest";
import {
    cambiosGrupoEpigrafeAApi,
    grupoEpigrafeDesdeApi,
    nuevoGrupoEpigrafeAApi,
} from "../infraestructura.ts";

describe("grupo de epígrafes infraestructura (co_gruposepigrafes)", () => {
    test("grupoEpigrafeDesdeApi mapea snake_case a dominio", () => {
        expect(
            grupoEpigrafeDesdeApi({
                id: 7,
                codigo: "4",
                descripcion: "ACREEDORES Y DEUDORES",
                ejercicio_id: "2026",
            }),
        ).toEqual({
            id: "7",
            codigo: "4",
            descripcion: "ACREEDORES Y DEUDORES",
            ejercicioId: "2026",
        });
    });

    test("nuevoGrupoEpigrafeAApi omite la descripción si va vacía", () => {
        expect(
            nuevoGrupoEpigrafeAApi({
                codigo: "4",
                descripcion: "",
                ejercicioId: "2026",
            }),
        ).toEqual({
            codigo: "4",
            ejercicio_id: "2026",
        });
    });

    test("cambiosGrupoEpigrafeAApi manda null al vaciar la descripción", () => {
        expect(cambiosGrupoEpigrafeAApi({ codigo: "5" }))
            .toEqual({ codigo: "5" });
        expect(cambiosGrupoEpigrafeAApi({ descripcion: "" }))
            .toEqual({ descripcion: null });
        expect(cambiosGrupoEpigrafeAApi({})).toEqual({});
    });
});

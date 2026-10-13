import { describe, expect, test } from "vitest";
import { nombreFicheroExportAeatModelo303 } from "../dominio.ts";

describe("modelo_303 dominio export AEAT", () => {
    test("nombreFicheroExportAeatModelo303 trimestre", () => {
        expect(
            nombreFicheroExportAeatModelo303({
                modeloId: 61,
                codejercicio: "2026",
                fechaInicio: "2026-04-01",
                trimestre: "2T",
                mes: null,
            })
        ).toBe("Resumen303_2026_2T.303");
    });

    test("nombreFicheroExportAeatModelo303 periodo mensual desde fecha", () => {
        expect(
            nombreFicheroExportAeatModelo303({
                modeloId: 10,
                codejercicio: "2026",
                fechaInicio: "2026-03-15",
                trimestre: null,
                mes: "Marzo",
            })
        ).toBe("Resumen303_2026_03.303");
    });

    test("nombreFicheroExportAeatModelo303 fallback sin periodo", () => {
        expect(
            nombreFicheroExportAeatModelo303({
                modeloId: 99,
                codejercicio: "",
                fechaInicio: "",
                trimestre: null,
                mes: null,
            })
        ).toBe("Resumen303_99.303");
    });
});

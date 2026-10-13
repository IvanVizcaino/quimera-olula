import { describe, expect, test, vi } from "vitest";

const { blob } = vi.hoisted(() => ({
    blob: vi.fn(),
}));

vi.mock("@olula/lib/api/rest_api.js", () => ({
    RestAPI: { blob },
}));

import {
    diffModelo303DesdeApi,
    getExportAeatModelo303,
    itemModelo303DesdeApi,
    modelo303CabeceraDesdeApi,
    resultadoGeneracionModelo303DesdeApi,
} from "../infraestructura.ts";

describe("modelo_303 infraestructura (T6.2)", () => {
    test("resultadoGeneracionModelo303DesdeApi mapea preview", () => {
        const r = resultadoGeneracionModelo303DesdeApi({
            modelo_id: 61,
            codejercicio: "2026",
            fecha_inicio: "2026-04-01",
            fecha_fin: "2026-06-30",
            calculado: { cuotadevtotal: 15872.23 },
            diffs: [{ clave: "cuotadif", almacenado: 1, calculado: 2, delta: 1 }],
            coincide: false,
        });

        expect(r.modeloId).toBe(61);
        expect(r.calculado.cuotadevtotal).toBe(15872.23);
        expect(r.diffs[0].delta).toBe(1);
        expect(diffModelo303DesdeApi({ clave: "x", almacenado: 0, calculado: 0, delta: 0 }).id).toBe("x");
    });

    test("itemModelo303DesdeApi y cabecera mapean listado", () => {
        const item = itemModelo303DesdeApi({
            id: 61,
            codejercicio: "2026",
            tipo_periodo: "T",
            trimestre: "2T",
            mes: null,
            fecha_inicio: "2026-04-01",
            fecha_fin: "2026-06-30",
            totales: {
                cuotadevtotal: 1,
                cuotadedtotal: 2,
                cuotadif: 3,
                resliquid: 4,
                cuotaresultado: 5,
            },
        });
        expect(item.modeloId).toBe(61);
        expect(item.id).toBe("61");
        expect(item.totales.cuotaresultado).toBe(5);

        const cab = modelo303CabeceraDesdeApi({
            id: 61,
            codejercicio: "2026",
            tipo_periodo: "T",
            trimestre: "2T",
            mes: null,
            fecha_inicio: "2026-04-01",
            fecha_fin: "2026-06-30",
            totales: {
                cuotadevtotal: 1,
                cuotadedtotal: 2,
                cuotadif: 3,
                resliquid: 4,
                cuotaresultado: 5,
            },
            complementaria: true,
            sinactividad: false,
        });
        expect(cab.complementaria).toBe(true);
    });

    test("getExportAeatModelo303 llama RestAPI.blob en export_aeat", async () => {
        const fichero = new Blob(["303"], { type: "text/plain" });
        blob.mockResolvedValueOnce(fichero);

        const res = await getExportAeatModelo303(61);

        expect(blob).toHaveBeenCalledWith(
            "/contabilidad/modelo_303/61/export_aeat",
            "Error al exportar fichero AEAT 303"
        );
        expect(res).toBe(fichero);
    });
});

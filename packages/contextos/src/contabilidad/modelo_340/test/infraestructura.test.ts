import { describe, expect, test, vi } from "vitest";

const { blob } = vi.hoisted(() => ({
    blob: vi.fn(),
}));

vi.mock("@olula/lib/api/rest_api.js", () => ({
    RestAPI: { blob },
}));

import {
    diffTotalModelo340DesdeApi,
    getExportAeatModelo340,
    registro340DesdeApi,
    resultadoGeneracionModelo340DesdeApi,
} from "../infraestructura.ts";

describe("modelo_340 infraestructura (T6.2)", () => {
    test("resultadoGeneracionModelo340DesdeApi mapea preview emitidas/recibidas", () => {
        const r = resultadoGeneracionModelo340DesdeApi({
            modelo_id: 7,
            codejercicio: "2024",
            registros: 2,
            baseimponible: 300,
            cuotaimpuesto: 63,
            totalfacturas: 363,
            emitidas: [
                {
                    tipolibro: "E",
                    idenfactura: "F-1",
                    apellidosnomrs: "Cliente SL",
                    cifnif: "B12345678",
                    baseimponible: 200,
                    cuotaimpuesto: 42,
                    operacion: null,
                },
            ],
            recibidas: [
                {
                    tipolibro: "R",
                    idenfactura: "P-9",
                    apellidosnomrs: "Proveedor SA",
                    cifnif: null,
                    baseimponible: 100,
                    cuotaimpuesto: 21,
                    operacion: "01",
                },
            ],
            diffs_totales: [],
            coincide: true,
        });

        expect(r.modeloId).toBe(7);
        expect(r.emitidas).toHaveLength(1);
        expect(r.recibidas[0].operacion).toBe("01");
        expect(r.coincide).toBe(true);
    });

    test("registro340DesdeApi y diffTotalModelo340DesdeApi asignan id", () => {
        expect(
            registro340DesdeApi({
                tipolibro: "E",
                idenfactura: "X",
                apellidosnomrs: "N",
                cifnif: null,
                baseimponible: 0,
                cuotaimpuesto: 0,
                operacion: null,
            }).id
        ).toBe("E|X");
        expect(
            diffTotalModelo340DesdeApi({ clave: "registros", almacenado: 0, calculado: 1, delta: 1 }).id
        ).toBe("registros");
    });

    test("getExportAeatModelo340 llama RestAPI.blob en export_aeat", async () => {
        const fichero = new Blob(["340"], { type: "text/plain" });
        blob.mockResolvedValueOnce(fichero);

        const res = await getExportAeatModelo340(7);

        expect(blob).toHaveBeenCalledWith(
            "/contabilidad/modelo_340/7/export_aeat",
            "Error al exportar fichero AEAT 340"
        );
        expect(res).toBe(fichero);
    });
});

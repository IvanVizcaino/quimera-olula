import { describe, expect, test, vi } from "vitest";

const { blob } = vi.hoisted(() => ({
    blob: vi.fn(),
}));

vi.mock("@olula/lib/api/rest_api.js", () => ({
    RestAPI: { blob },
}));

import {
    diffTotalModelo349DesdeApi,
    getExportAeatModelo349,
    operacion349DesdeApi,
    resultadoGeneracionModelo349DesdeApi,
} from "../infraestructura.ts";

describe("modelo_349 infraestructura (T6.2)", () => {
    test("resultadoGeneracionModelo349DesdeApi mapea preview", () => {
        const r = resultadoGeneracionModelo349DesdeApi({
            modelo_id: 3,
            codejercicio: "2025",
            numtotaloi: 2,
            importetotaloi: 1500.25,
            numtotaloirec: 0,
            importetotaloirec: 0,
            operaciones: [
                {
                    clave: "E",
                    codcliente: "000001",
                    codproveedor: null,
                    codpais: "FR",
                    codue: "FR123",
                    cifnif: "FR12345678",
                    nombre: "Cliente UE",
                    baseimponible: 1500.25,
                },
            ],
            diffs_totales: [{ clave: "importetotaloi", almacenado: 0, calculado: 1500.25, delta: 1500.25 }],
            diffs_operaciones: [{ clave: "E", tipo: "nueva" }],
            coincide: false,
        });

        expect(r.modeloId).toBe(3);
        expect(r.importetotaloi).toBe(1500.25);
        expect(r.operaciones[0].codcliente).toBe("000001");
        expect(r.diffsTotales[0].delta).toBe(1500.25);
    });

    test("operacion349DesdeApi y diffTotalModelo349DesdeApi asignan id", () => {
        const o = operacion349DesdeApi({
            clave: "A",
            codcliente: null,
            codproveedor: "P1",
            codpais: "DE",
            codue: "X",
            cifnif: "DE1",
            nombre: "Prov",
            baseimponible: 100,
        });
        expect(o.id).toBe("A||P1|DE1");
        expect(diffTotalModelo349DesdeApi({ clave: "numtotaloi", almacenado: 1, calculado: 2, delta: 1 }).id).toBe(
            "numtotaloi"
        );
    });

    test("getExportAeatModelo349 llama RestAPI.blob en export_aeat", async () => {
        const fichero = new Blob(["349"], { type: "text/plain" });
        blob.mockResolvedValueOnce(fichero);

        const res = await getExportAeatModelo349(3);

        expect(blob).toHaveBeenCalledWith(
            "/contabilidad/modelo_349/3/export_aeat",
            "Error al exportar fichero AEAT 349"
        );
        expect(res).toBe(fichero);
    });
});

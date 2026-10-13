import { describe, expect, test, vi } from "vitest";

const { blob } = vi.hoisted(() => ({
    blob: vi.fn(),
}));

vi.mock("@olula/lib/api/rest_api.js", () => ({
    RestAPI: { blob },
}));

import {
    declarado347DesdeApi,
    diffTotalModelo347DesdeApi,
    getExportAeatModelo347,
    resultadoGeneracionModelo347DesdeApi,
} from "../infraestructura.ts";

describe("modelo_347 infraestructura (T6.2)", () => {
    test("resultadoGeneracionModelo347DesdeApi mapea preview y CP", () => {
        const r = resultadoGeneracionModelo347DesdeApi({
            modelo_id: 16,
            anio: "2025",
            origen: "Facturación",
            totalentidades: 42,
            importetotal: 125000.5,
            totalinmuebles: 0,
            totalarrendamiento: 0,
            declarados: [
                {
                    nifdeclarado: "B12345678",
                    apellidosnombrers: "Ejemplo SL",
                    clavecodigo: "A",
                    codclienteprov: "000001",
                    codpostal: "46001",
                    importe: 5000,
                    importet1: 1000,
                    importet2: 1000,
                    importet3: 1000,
                    importet4: 2000,
                    importemetalico: 0,
                },
            ],
            diffs_totales: [{ clave: "importetotal", almacenado: 1, calculado: 2, delta: 1 }],
            diffs_declarados: [{ clave: ["B12345678", "A"], tipo: "importe", campos: [] }],
            coincide: false,
        });

        expect(r.modeloId).toBe(16);
        expect(r.importetotal).toBe(125000.5);
        expect(r.declarados[0].codpostal).toBe("46001");
        expect(r.diffsTotales[0].delta).toBe(1);
        expect(r.diffsDeclarados).toHaveLength(1);
    });

    test("declarado347DesdeApi y diffTotalModelo347DesdeApi asignan id", () => {
        const d = declarado347DesdeApi({
            nifdeclarado: "X",
            apellidosnombrers: "N",
            clavecodigo: "B",
            codclienteprov: "1",
            codpostal: null,
            importe: 0,
            importet1: 0,
            importet2: 0,
            importet3: 0,
            importet4: 0,
            importemetalico: 0,
        });
        expect(d.id).toBe("X|B");
        expect(
            diffTotalModelo347DesdeApi({ clave: "importetotal", almacenado: 0, calculado: 0, delta: 0 }).id
        ).toBe("importetotal");
    });

    test("getExportAeatModelo347 llama RestAPI.blob en export_aeat", async () => {
        const fichero = new Blob(["347"], { type: "text/plain" });
        blob.mockResolvedValueOnce(fichero);

        const res = await getExportAeatModelo347(16);

        expect(blob).toHaveBeenCalledWith(
            "/contabilidad/modelo_347/16/export_aeat",
            "Error al exportar fichero AEAT 347"
        );
        expect(res).toBe(fichero);
    });
});

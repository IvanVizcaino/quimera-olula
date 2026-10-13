import { describe, expect, test, vi } from "vitest";

const get = vi.fn();

vi.mock("@olula/lib/api/rest_api.js", () => ({
    RestAPI: { get },
}));

const { getArticulo } = await import("#/almacen/articulo/infraestructura.ts");

describe("articulo unidad_id (plugin pesos_medidas)", () => {
    test("getArticulo mapea campos de unidad desde la API", async () => {
        get.mockResolvedValueOnce({
            datos: {
                id: "ART1",
                descripcion: "Café",
                observaciones: null,
                barcode: null,
                tipo_barcode: null,
                familia_id: "0001",
                descripcion_familia: "Fam",
                sin_stock: false,
                se_compra: true,
                se_vende: true,
                unidad_id: "KG",
                descripcion_unidad: "Kilogramo",
                magnitud_unidad: "Peso",
                factor_conv_unidad: 1,
                proveedores: [],
            },
        });

        const articulo = await getArticulo("ART1");

        expect(articulo.unidadId).toBe("KG");
        expect(articulo.descripcionUnidad).toBe("Kilogramo");
        expect(articulo.magnitudUnidad).toBe("Peso");
        expect(articulo.factorConvUnidad).toBe(1);
    });
});

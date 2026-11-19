import { reinicioAlCambiarArticulo } from "#/compras/comun/dominio.ts";
import { describe, expect, test } from "vitest";

describe("cambio de artículo en una línea nueva de compra", () => {
    test("al elegir un artículo se recalculan el coste y el impuesto (el del artículo)", () => {
        expect(reinicioAlCambiarArticulo({ referencia: "ART-1" })).toEqual({
            pvpUnitario: null,
            grupoIvaProductoId: null,
        });
    });

    test("al quitar el artículo se recalcula el coste y se conserva el impuesto", () => {
        expect(reinicioAlCambiarArticulo({ referencia: null })).toEqual({ pvpUnitario: null });
    });

    test("si no cambia el artículo no se toca nada", () => {
        expect(reinicioAlCambiarArticulo({})).toEqual({});
    });
});

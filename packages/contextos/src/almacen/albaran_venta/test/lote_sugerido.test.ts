import { describe, expect, test, vi } from "vitest";

// Mock RestAPI antes de importar el módulo que lo usa
const get = vi.fn();

vi.mock("@olula/lib/api/rest_api.js", () => ({
    RestAPI: { get },
}));

const { getLoteSugerido } = await import("#/almacen/albaran_venta/infraestructura.ts");

describe("getLoteSugerido (CC-04)", () => {

    test("devuelve el codlote cuando el backend lo tiene", async () => {
        get.mockResolvedValueOnce({ codlote: "1L17426" });

        const resultado = await getLoteSugerido("REF001");

        expect(resultado).toBe("1L17426");
        expect(get).toHaveBeenCalledWith(
            "/almacen/lote/sugerido?referencia=REF001"
        );
    });

    test("devuelve null cuando el plugin está inactivo o no hay lote previo", async () => {
        get.mockResolvedValueOnce({ codlote: null });

        const resultado = await getLoteSugerido("REF002");

        expect(resultado).toBeNull();
    });

    test("codifica la referencia con caracteres especiales", async () => {
        get.mockResolvedValueOnce({ codlote: null });

        await getLoteSugerido("REF A/B");

        expect(get).toHaveBeenCalledWith(
            "/almacen/lote/sugerido?referencia=REF%20A%2FB"
        );
    });
});

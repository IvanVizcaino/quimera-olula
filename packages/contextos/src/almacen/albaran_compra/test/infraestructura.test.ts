import { describe, expect, test, vi } from "vitest";

const patch = vi.fn();

vi.mock("@olula/lib/api/rest_api.js", () => ({
    RestAPI: { patch },
}));

const { postBorrarMovimientoLoteCompra, postCrearMovimientoLoteCompra } = await import(
    "#/almacen/albaran_compra/infraestructura.ts"
);

describe("albaran_compra movimientos de lote", () => {
    test("PATCH crear_movimiento_lote", async () => {
        patch.mockResolvedValueOnce(undefined);

        await postCrearMovimientoLoteCompra("doc-1", "lin-2", {
            lote_id: "L001",
            cantidad: 3,
        });

        expect(patch).toHaveBeenCalledWith(
            "/almacen/albaran_compra/doc-1/linea/lin-2/crear_movimiento_lote",
            { lote_id: "L001", cantidad: 3 },
            "Error al crear movimiento de lote"
        );
    });

    test("PATCH borrar_movimiento_lote", async () => {
        patch.mockResolvedValueOnce(undefined);

        await postBorrarMovimientoLoteCompra("fac-9", "lin-1", { movimiento_id: "mov-7" });

        expect(patch).toHaveBeenCalledWith(
            "/almacen/albaran_compra/fac-9/linea/lin-1/borrar_movimiento_lote",
            { movimiento_id: "mov-7" },
            "Error al borrar movimiento de lote"
        );
    });
});

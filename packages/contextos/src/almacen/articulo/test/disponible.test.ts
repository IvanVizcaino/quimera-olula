import { describe, expect, test, vi } from "vitest";

const get = vi.fn();

vi.mock("@olula/lib/api/rest_api.js", () => ({
    RestAPI: { get },
}));

const { getArticulo } = await import("#/almacen/articulo/infraestructura.ts");
const { columnaDisponible, metaTablaConDisponible } = await import(
    "#/almacen/articulo/maestro/disponible.ts"
);
const { metaTablaArticuloBase } = await import("#/almacen/articulo/maestro/MaestroConDetalleArticulo.tsx");

describe("articulo total_disponible (plugin disponible_art)", () => {
    test("getArticulo mapea total_disponible", async () => {
        get.mockResolvedValueOnce({
            datos: {
                id: "ART1",
                descripcion: "Café",
                observaciones: null,
                barcode: null,
                tipo_barcode: null,
                familia_id: "0001",
                descripcion_familia: "Fam",
                grupo_iva_producto_id: "GEN",
                sin_stock: false,
                se_compra: true,
                se_vende: true,
                total_disponible: 12.5,
                proveedores: [],
            },
        });
        const art = await getArticulo("ART1");
        expect(art.totalDisponible).toBe(12.5);
        expect(art.grupoIvaProductoId).toBe("GEN");
    });

    test("sin el campo (plugin inactivo) queda undefined", async () => {
        get.mockResolvedValueOnce({
            datos: {
                id: "ART2",
                descripcion: "Té",
                observaciones: null,
                barcode: null,
                tipo_barcode: null,
                familia_id: null,
                descripcion_familia: null,
                sin_stock: false,
                se_compra: true,
                se_vende: true,
                proveedores: [],
            },
        });
        expect((await getArticulo("ART2")).totalDisponible).toBeUndefined();
    });

    test("columna Disponible solo se añade con el plugin activo y sin duplicar", () => {
        expect(metaTablaConDisponible(metaTablaArticuloBase, false)).toBe(metaTablaArticuloBase);
        const con = metaTablaConDisponible(metaTablaArticuloBase, true);
        expect(con.map((c) => c.id)).toEqual([...metaTablaArticuloBase.map((c) => c.id), "totalDisponible"]);
        expect(metaTablaConDisponible(con, true)).toBe(con);
    });

    test("render de la columna: vacío si no hay valor", () => {
        const a = { id: "A", descripcion: "x" } as never;
        expect(columnaDisponible.render(a)).toBe("");
        expect(columnaDisponible.render({ totalDisponible: 3 } as never)).toBe("3");
        expect(columnaDisponible.render({ totalDisponible: 0 } as never)).toBe("0");
    });
});

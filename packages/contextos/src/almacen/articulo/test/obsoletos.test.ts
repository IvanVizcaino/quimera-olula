import { describe, expect, test, vi } from "vitest";

const get = vi.fn();
const patch = vi.fn();

vi.mock("@olula/lib/api/rest_api.js", () => ({
    RestAPI: { get, patch },
}));

const { getArticulo, patchArticulo } = await import("#/almacen/articulo/infraestructura.ts");
const {
    criteriaSinObsoletos,
    filtroOcultarObsoletos,
    metaFiltroConObsoletos,
} = await import("#/almacen/articulo/maestro/obsoletos.ts");
const { metaFiltroArticuloBase } = await import(
    "#/almacen/articulo/maestro/MaestroConDetalleArticulo.tsx"
);

const articuloApi = (extra: Record<string, unknown> = {}) => ({
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
    proveedores: [],
    ...extra,
});

const criteria = (filtro: [string, string, string?][]) => ({
    filtro,
    orden: [] as string[],
    paginacion: { limite: 10, pagina: 1 },
});

describe("articulo obsoleto (plugin art_obsoletos)", () => {
    test("getArticulo mapea obsoleto", async () => {
        get.mockResolvedValueOnce({ datos: articuloApi({ obsoleto: true }) });

        expect((await getArticulo("ART1")).obsoleto).toBe(true);
    });

    test("sin el campo (plugin inactivo) es false, no undefined", async () => {
        get.mockResolvedValueOnce({ datos: articuloApi() });

        expect((await getArticulo("ART1")).obsoleto).toBe(false);
    });

    test("patchArticulo envía obsoleto", async () => {
        patch.mockResolvedValueOnce(undefined);

        await patchArticulo("ART1", { obsoleto: true });

        expect(patch.mock.calls[0][1]).toEqual({ obsoleto: true });
    });

    test("el filtro solo se añade con el plugin activo y sin duplicar", () => {
        expect(metaFiltroConObsoletos(metaFiltroArticuloBase, false)).toBe(
            metaFiltroArticuloBase
        );
        const con = metaFiltroConObsoletos(metaFiltroArticuloBase, true);
        expect(con.ocultar_obsoletos.label).toBe("Ocultar obsoletos");
        expect(metaFiltroConObsoletos(con, true)).toBe(con);
    });

    test("marcado oculta obsoletos; desmarcado no filtra", () => {
        expect(filtroOcultarObsoletos.filtro("true")).toEqual([
            "obsoleto",
            "=",
            "false",
        ]);
        expect(filtroOcultarObsoletos.filtro("")).toBeNull();
    });

    test("el panel de filtros se hidrata marcado desde el criteria", () => {
        expect(filtroOcultarObsoletos.fromFiltro([["obsoleto", "=", "false"]])).toBe(
            "true"
        );
        expect(filtroOcultarObsoletos.fromFiltro([["sin_stock", "=", "false"]])).toBe(
            ""
        );
    });

    test("el criteria inicial oculta obsoletos con el plugin activo", () => {
        const base = criteria([["sin_stock", "=", "false"]]);

        expect(criteriaSinObsoletos(base, false)).toBe(base);
        expect(criteriaSinObsoletos(base, true).filtro).toEqual([
            ["sin_stock", "=", "false"],
            ["obsoleto", "=", "false"],
        ]);
    });

    test("no duplica la cláusula si el criteria ya trae obsoleto", () => {
        const base = criteria([["obsoleto", "=", "true"]]);

        expect(criteriaSinObsoletos(base, true)).toBe(base);
    });
});

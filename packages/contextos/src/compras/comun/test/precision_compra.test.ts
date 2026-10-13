import { formatearMoneda } from "@olula/lib/dominio.ts";
import { afterEach, describe, expect, test } from "vitest";
import { metaLineaAlbaran, metaNuevaLineaAlbaran } from "../../albaran/dominio.ts";
import { metaTablaLineaAlbaran } from "../../albaran/detalle/lineas/metatabla_linea_albaran.tsx";
import { metaArticuloProveedor, metaNuevoArticuloProveedor } from "../../articulo_proveedor/dominio.ts";
import { metaTablaLineaFactura } from "../../factura/detalle/lineas/metatabla_linea_factura.tsx";
import { metaLineaFactura, metaNuevaLineaFactura } from "../../factura/dominio.ts";
import { metaTablaLineaPedido } from "../../pedido/detalle/lineas/metatabla_linea_pedido.tsx";
import { metaLineaPedido, metaNuevaLineaPedido } from "../../pedido/dominio.ts";
import { decimalesPrecioCompra } from "../dominio.ts";

const conPlugin = (estado: string | null) =>
    localStorage.setItem(
        "whoami",
        JSON.stringify({ plugins: estado === null ? {} : { precision_compra: estado } })
    );

const columna = (cols: { id: string; decimales?: number }[], id: string) =>
    cols.find((c) => c.id === id);

const campoDec = (meta: { campos: Record<string, { decimales?: number }> }, campo: string) =>
    meta.campos[campo].decimales;

afterEach(() => localStorage.clear());

describe("C-03 precision_compra (4 decimales en precios de compra)", () => {
    test("decimalesPrecioCompra depende del plugin", () => {
        conPlugin(null);
        expect(decimalesPrecioCompra()).toBe(2);
        conPlugin("activo");
        expect(decimalesPrecioCompra()).toBe(4);
    });

    test("formatearMoneda admite decimales fijos", () => {
        expect(formatearMoneda(1.23456, "EUR")).toContain("1,23");
        expect(formatearMoneda(1.23456, "EUR", 4)).toContain("1,2346");
    });

    test("metaModelo de líneas lee el plugin al usarse (no al importar)", () => {
        const metas = [
            metaLineaPedido, metaNuevaLineaPedido,
            metaLineaAlbaran, metaNuevaLineaAlbaran,
            metaLineaFactura, metaNuevaLineaFactura,
        ];
        conPlugin(null);
        metas.forEach((m) => expect(campoDec(m as never, "pvpUnitario")).toBe(2));
        conPlugin("activo");
        metas.forEach((m) => expect(campoDec(m as never, "pvpUnitario")).toBe(4));
    });

    test("tablas de líneas formatean coste y total con 4 decimales solo con plugin", () => {
        const tablas = [metaTablaLineaPedido, metaTablaLineaAlbaran, metaTablaLineaFactura];
        conPlugin(null);
        tablas.forEach((t) => {
            expect(columna(t("EUR"), "pvpUnitario")?.decimales).toBe(2);
            expect(columna(t("EUR"), "pvpTotal")?.decimales).toBe(2);
        });
        conPlugin("activo");
        tablas.forEach((t) => {
            const cols = t("EUR");
            expect(columna(cols, "pvpUnitario")?.decimales).toBe(4);
            expect(columna(cols, "pvpTotal")?.decimales).toBe(4);
        });
    });

    test("metaModelo pvpTotal de líneas editadas sigue el plugin", () => {
        const metas = [metaLineaPedido, metaNuevaLineaPedido, metaLineaAlbaran, metaLineaFactura];
        conPlugin(null);
        metas.forEach((m) => expect(campoDec(m as never, "pvpTotal")).toBe(2));
        conPlugin("activo");
        metas.forEach((m) => expect(campoDec(m as never, "pvpTotal")).toBe(4));
    });

    test("coste articulo_proveedor sigue precision_compra", () => {
        conPlugin(null);
        expect(campoDec(metaArticuloProveedor as never, "coste")).toBe(2);
        expect(campoDec(metaNuevoArticuloProveedor as never, "coste")).toBe(2);
        conPlugin("activo");
        expect(campoDec(metaArticuloProveedor as never, "coste")).toBe(4);
        expect(campoDec(metaNuevoArticuloProveedor as never, "coste")).toBe(4);
    });
});

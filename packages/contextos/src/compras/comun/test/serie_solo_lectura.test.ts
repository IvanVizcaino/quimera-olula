import { albaranVacio, metaAlbaran } from "#/compras/albaran/detalle/detalle.ts";
import { facturaVacia, metaFactura } from "#/compras/factura/detalle/detalle.ts";
import { metaPedido, pedidoVacio } from "#/compras/pedido/detalle/detalle.ts";
import { modeloEsEditable } from "@olula/lib/dominio.ts";
import { describe, expect, test } from "vitest";

/*
 * Pestaña Datos: la serie se muestra pero no se cambia. Eneboo deshabilita
 * fdbCodSerie al editar pedidos, albaranes y facturas de proveedor
 * (pedidosprov.qs, albaranesprov.qs, facturasprov.qs).
 */
const pedidoPendiente = { ...pedidoVacio(), recibido: null, serieId: "A" };
const albaranSinFacturar = { ...albaranVacio(), facturaId: null, serieId: "A" };
const facturaEditable = { ...facturaVacia(), editable: true, serieId: "A" };

describe("la serie es de solo lectura en la pestaña Datos de los documentos de compra", () => {
    test("pedido pendiente: serieId bloqueada y la fecha sigue editable", () => {
        expect(modeloEsEditable(metaPedido)(pedidoPendiente, "serieId")).toBe(false);
        expect(modeloEsEditable(metaPedido)(pedidoPendiente, "fecha")).toBe(true);
    });

    test("albarán sin facturar: serieId bloqueada y la fecha sigue editable", () => {
        expect(modeloEsEditable(metaAlbaran)(albaranSinFacturar, "serieId")).toBe(false);
        expect(modeloEsEditable(metaAlbaran)(albaranSinFacturar, "fecha")).toBe(true);
    });

    test("factura editable: serieId bloqueada y la fecha sigue editable", () => {
        expect(modeloEsEditable(metaFactura)(facturaEditable, "serieId")).toBe(false);
        expect(modeloEsEditable(metaFactura)(facturaEditable, "fecha")).toBe(true);
    });
});

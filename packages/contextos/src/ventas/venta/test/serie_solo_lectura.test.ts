import { metaAlbaran, albaranVacio } from "#/ventas/albaran/dominio.ts";
import { metaFactura } from "#/ventas/factura/detalle/diseño.ts";
import { facturaVacia } from "#/ventas/factura/dominio.ts";
import { metaPedido, pedidoVacio } from "#/ventas/pedido/detalle/detalle.ts";
import { metaPresupuesto, presupuestoVacio } from "#/ventas/presupuesto/detalle/detalle.ts";
import { modeloEsEditable } from "@olula/lib/dominio.ts";
import { describe, expect, test } from "vitest";

/*
 * Pestaña Datos: la serie se muestra pero no se cambia. Eneboo la deshabilita al
 * editar presupuestos, pedidos y albaranes; en facturas solo la deja cambiar en
 * borrador VeriFactu, pero el servidor no tiene ese cambio (pendiente).
 */
// En borrador la factura es editable: es justo el caso en el que Eneboo deja cambiar la serie.
const facturaBorrador = { ...facturaVacia(), estadoExpedicion: "BORRADOR" as const, serie_id: "A" };

describe("la serie es de solo lectura en la pestaña Datos de los cuatro documentos", () => {
    const casos = [
        ["presupuesto", () => modeloEsEditable(metaPresupuesto)({ ...presupuestoVacio(), serie_id: "A" }, "serie_id")],
        ["pedido", () => modeloEsEditable(metaPedido)({ ...pedidoVacio(), serie_id: "A" }, "serie_id")],
        ["albarán", () => modeloEsEditable(metaAlbaran)({ ...albaranVacio(), serie_id: "A" }, "serie_id")],
        ["factura", () => modeloEsEditable(metaFactura)(facturaBorrador, "serie_id")],
    ] as const;

    for (const [documento, serieEditable] of casos) {
        test(`${documento}: serie_id bloqueada`, () => {
            expect(serieEditable()).toBe(false);
        });
    }

    test("el resto de la cabecera sigue editable (la fecha del presupuesto y de la factura en borrador)", () => {
        expect(modeloEsEditable(metaPresupuesto)(presupuestoVacio(), "fecha")).toBe(true);
        expect(modeloEsEditable(metaFactura)(facturaBorrador, "fecha")).toBe(true);
    });
});

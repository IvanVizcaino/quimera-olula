import { crearWidgets, WidgetContextFactory } from "@olula/lib/widgets.ts";
import { describe, expect, test } from "vitest";
import FactoryCremaCafe from "../src/factory.ts";

describe("crema_cafe: widgets Home (F-07 / T1.1)", () => {
    test("registra widgets de ventas, tesorería y TPV", () => {
        const widgets = crearWidgets(
            new FactoryCremaCafe() as unknown as Record<
                string,
                WidgetContextFactory
            >
        );

        expect(widgets.map((w) => w.id)).toEqual([
            "ventas.widget.pedidos_pendientes",
            "tesoreria.widget.recibos_cobro",
            "tpv.widget.arqueo_caja",
        ]);

        expect(widgets.map((w) => w.regla)).toEqual([
            "ventas.pedido.leer",
            "tesoreria.recibo_venta",
            "tpv.arqueo.leer",
        ]);
    });
});

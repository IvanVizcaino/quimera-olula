import { describe, expect, test } from "vitest";
import {
    periodoIvaAApiParaTest,
    periodoIvaDesdeApiParaTest,
} from "../infraestructura.ts";

describe("periodo_iva infraestructura (T6.3)", () => {
    test("periodoIvaDesdeApi mapea snake_case y fechas", () => {
        expect(
            periodoIvaDesdeApiParaTest({
                id: "42",
                impuesto_id: "GEN",
                fecha_desde: "2024-07-01",
                fecha_hasta: null,
                iva: 21,
                recargo: 5.2,
            }),
        ).toEqual({
            id: "42",
            impuestoId: "GEN",
            fechaDesde: new Date("2024-07-01"),
            fechaHasta: null,
            iva: 21,
            recargo: 5.2,
        });
    });

    test("periodoIvaAApi envía fechas ISO y tipos al PATCH", () => {
        expect(
            periodoIvaAApiParaTest({
                fechaDesde: new Date("2025-01-01T12:00:00Z"),
                iva: 10,
                recargo: 1.4,
            }),
        ).toEqual({
            fecha_desde: "2025-01-01",
            iva: 10,
            recargo: 1.4,
        });
    });
});

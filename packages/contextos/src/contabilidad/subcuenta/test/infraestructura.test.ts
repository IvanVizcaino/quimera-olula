import { describe, expect, test } from "vitest";
import { cambiosSubcuentaAApi, subcuentaDesdeApi } from "../infraestructura.ts";

describe("subcuenta infraestructura (T6.4 autocomplete)", () => {
    test("subcuentaDesdeApi mapea snake_case a dominio", () => {
        expect(
            subcuentaDesdeApi({
                id: 12345,
                codigo: "4300000001",
                nombre: "CLIENTE EJEMPLO SL",
                ejercicio_id: "2026",
                cuenta_id: 99,
                codigo_cuenta: "430",
                impuesto_id: "GEN",
                iva: 21,
                recargo: 5.2,
            }),
        ).toEqual({
            id: "12345",
            codigo: "4300000001",
            nombre: "CLIENTE EJEMPLO SL",
            ejercicioId: "2026",
            cuentaId: 99,
            codigoCuenta: "430",
            impuestoId: "GEN",
            iva: 21,
            recargo: 5.2,
        });
    });

    test("subcuentaDesdeApi sin IVA usa defaults", () => {
        expect(
            subcuentaDesdeApi({
                id: 1,
                codigo: "4300000001",
                nombre: "X",
                ejercicio_id: "2026",
                cuenta_id: 1,
                codigo_cuenta: "430",
            }).impuestoId,
        ).toBe("");
    });

    test("cambiosSubcuentaAApi envía descripción e impuesto", () => {
        expect(cambiosSubcuentaAApi({ nombre: "NUEVA" })).toEqual({ nombre: "NUEVA" });
        expect(cambiosSubcuentaAApi({ impuestoId: "GEN" })).toEqual({
            impuesto_id: "GEN",
        });
        expect(cambiosSubcuentaAApi({ impuestoId: "" })).toEqual({
            impuesto_id: null,
        });
    });
});

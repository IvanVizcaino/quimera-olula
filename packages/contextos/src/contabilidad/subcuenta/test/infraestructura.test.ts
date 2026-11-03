import { describe, expect, test } from "vitest";
import { cambiosSubcuentaAApi, subcuentaDesdeApi } from "../infraestructura.ts";

describe("subcuenta infraestructura", () => {
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
            cuentaEspecialId: "",
            esIva: false,
        });
    });

    test("subcuentaDesdeApi trae el tipo especial de su cuenta", () => {
        expect(
            subcuentaDesdeApi({
                id: 7,
                codigo: "4720000001",
                nombre: "IVA SOPORTADO",
                ejercicio_id: "2026",
                cuenta_id: 47,
                codigo_cuenta: "472",
                cuenta_especial_id: "IVASOP",
                es_iva: true,
            }),
        ).toMatchObject({
            cuentaEspecialId: "IVASOP",
            esIva: true,
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

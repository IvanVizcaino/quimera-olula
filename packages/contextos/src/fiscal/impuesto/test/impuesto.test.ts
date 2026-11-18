import { describe, expect, test, vi } from "vitest";

vi.mock("#/contabilidad/asiento/dominio.ts", () => ({ ejercicioActual: () => "2026" }));

const { cambiosImpuestoAApi, impuestoDesdeApi, nuevoImpuestoAApi, SUBCUENTAS } = await import("../dominio.ts");
const { SUBCUENTAS_COMPRAS, SUBCUENTAS_VENTAS } = await import("../subcuentas.ts");

const api = {
    id: "GEN", descripcion: "I.V.A. General", iva: 21, recargo: 5.2, tipo_bienes: "Corrientes",
    subcuentas: { rep: { codigo: "4770000000", id: 3 } },
};

describe("impuestos (impuestos.mtd)", () => {
    test("impuestoDesdeApi aplana las subcuentas", () => {
        const impuesto = impuestoDesdeApi(api);
        expect(impuesto.sc_rep).toBe("4770000000");
        expect(impuesto.sc_sop).toBe("");
        expect(impuesto.iva).toBe(21);
    });

    test("cambios: subcuentas aparte y con el ejercicio actual; vacía la quita", () => {
        const impuesto = impuestoDesdeApi(api);
        expect(cambiosImpuestoAApi(impuesto, { ...impuesto, iva: 10, sc_rep: "", sc_sop: "472.1" }))
            .toEqual({ iva: 10, subcuentas: { rep: "", sop: "472.1" }, ejercicio_id: "2026" });
        expect(cambiosImpuestoAApi(impuesto, { ...impuesto, tipoBienes: "Servicios" }))
            .toEqual({ tipo_bienes: "Servicios" });
    });

    test("alta: solo las subcuentas informadas", () => {
        const nuevo = { ...impuestoDesdeApi(api), id: " RED " };
        expect(nuevoImpuestoAApi(nuevo)).toMatchObject({
            id: "RED", iva: 21, subcuentas: { rep: "4770000000" }, ejercicio_id: "2026",
        });
    });

    test("subcuenta vaciada (null en el formulario) se envía como quitada", () => {
        const impuesto = impuestoDesdeApi(api);
        expect(cambiosImpuestoAApi(impuesto, { ...impuesto, sc_rep: null as unknown as string }))
            .toEqual({ subcuentas: { rep: "" }, ejercicio_id: "2026" });
    });

    test("las 19 subcuentas, repartidas entre compras y ventas sin repetir", () => {
        expect(SUBCUENTAS_COMPRAS).toHaveLength(12);
        expect(SUBCUENTAS_VENTAS).toHaveLength(7);
        expect(new Set(SUBCUENTAS.map((s) => s.sufijo)).size).toBe(19);
    });
});

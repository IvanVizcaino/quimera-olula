import { beforeEach, describe, expect, test, vi } from "vitest";

const { get } = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@olula/lib/api/rest_api.ts", () => ({ RestAPI: { get } }));

const { getSubcuentasRegularizacionIva } = await import("../infraestructura.ts");

describe("subcuentas H.P. por defecto de la regularización de IVA", () => {
    beforeEach(() => get.mockReset());

    test("pide las del ejercicio y las pasa a dominio", async () => {
        get.mockResolvedValue({
            datos: {
                codigo_subcuenta_deudora: "4700000000",
                codigo_subcuenta_acreedora: "4750000000",
            },
        });

        const subcuentas = await getSubcuentasRegularizacionIva("2026");

        expect(get).toHaveBeenCalledWith(
            "/contabilidad/regularizacion_iva/subcuentas_defecto/2026"
        );
        expect(subcuentas).toEqual({
            codigoSubcuentaDeudora: "4700000000",
            codigoSubcuentaAcreedora: "4750000000",
        });
    });

    test("sin subcuentas en el ejercicio deja los campos vacíos", async () => {
        get.mockResolvedValue({
            datos: { codigo_subcuenta_deudora: null, codigo_subcuenta_acreedora: null },
        });

        expect(await getSubcuentasRegularizacionIva("2026")).toEqual({
            codigoSubcuentaDeudora: "",
            codigoSubcuentaAcreedora: "",
        });
    });
});

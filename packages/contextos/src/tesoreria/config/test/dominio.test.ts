import { flagsDesdeModo, modoDesdeFlags } from "#/tesoreria/config/dominio.ts";
import { configTesoreriaAApi, configTesoreriaDesdeApi } from "#/tesoreria/config/infraestructura.ts";
import { describe, expect, test } from "vitest";

describe("modo de pago de remesas", () => {
    test("los flags de bd dan el modo; el indirecto manda sobre el diferido", () => {
        expect(modoDesdeFlags(false, false)).toBe("directo");
        expect(modoDesdeFlags(true, false)).toBe("diferido");
        expect(modoDesdeFlags(true, true)).toBe("indirecto");
        expect(modoDesdeFlags(false, true)).toBe("indirecto");
    });

    test("el indirecto se guarda con el diferido activo, como exige el servidor", () => {
        expect(flagsDesdeModo("directo")).toEqual({ diferido: false, indirecto: false });
        expect(flagsDesdeModo("diferido")).toEqual({ diferido: true, indirecto: false });
        expect(flagsDesdeModo("indirecto")).toEqual({ diferido: true, indirecto: true });
    });

    test("cobros y pagos van a sus propios campos de la API", () => {
        const api = configTesoreriaAApi({ modoCobro: "indirecto", modoPago: "diferido" }, true);

        expect(api).toEqual({
            pago_diferido: true, pago_indirecto: true,
            pago_diferido_prov: true, pago_indirecto_prov: false,
        });
        expect(configTesoreriaDesdeApi(api)).toEqual({ modoCobro: "indirecto", modoPago: "diferido" });
    });

    test("sin el plugin de remesas de pago no se envían sus campos", () => {
        const api = configTesoreriaAApi({ modoCobro: "diferido", modoPago: "indirecto" }, false);

        expect(api).toEqual({ pago_diferido: true, pago_indirecto: false });
        expect(configTesoreriaDesdeApi(api).modoPago).toBe("directo");
    });
});

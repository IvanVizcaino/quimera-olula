import { interpretarMensajeWealthReader } from "#/tesoreria/comun/proveedor_bancario/wealthreader/dominio.ts";
import { describe, expect, test } from "vitest";

describe("mensajes del widget de Wealth Reader", () => {
    test("flow completed termina la conexión", () => {
        expect(interpretarMensajeWealthReader("flow completed")).toEqual({ tipo: "completado" });
    });

    test("un JSON con error es un aviso con su código", () => {
        const mensaje = JSON.stringify({ error: { code: 2010, message: "Introduce el código OTP" } });

        expect(interpretarMensajeWealthReader(mensaje))
            .toEqual({ tipo: "error", texto: "Introduce el código OTP (código 2010)" });
    });

    test("el resto se ignora", () => {
        expect(interpretarMensajeWealthReader({ altura: 400 })).toEqual({ tipo: "otro" });
        expect(interpretarMensajeWealthReader("no es json")).toEqual({ tipo: "otro" });
        expect(interpretarMensajeWealthReader(JSON.stringify({ altura: 400 }))).toEqual({ tipo: "otro" });
    });
});

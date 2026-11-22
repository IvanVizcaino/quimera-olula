import { describe, expect, test } from "vitest";
import { cambiosDivisa, divisaVacio, nuevoDivisaVacio } from "../dominio.ts";
import { cambiosDivisaAApi, divisaDesdeApi, nuevaDivisaAApi } from "../infraestructura.ts";

describe("divisas (divisas)", () => {
    test("valores por defecto del .mtd", () => {
        expect(nuevoDivisaVacio()).toMatchObject({ tasaConversion: 1, cifrasDecimales: 2 });
    });

    test("divisaDesdeApi convierte la fecha y los nulos", () => {
        const divisa = divisaDesdeApi({
            id: "USD", descripcion: null, tasa_conversion: 1.08, fecha: "2026-11-10",
            codigo_iso: null, simbolo: "$", monedas_billetes: null, cifras_decimales: null,
        });
        expect(divisa.fecha?.getDate()).toBe(10);
        expect(divisa).toMatchObject({ descripcion: "", simbolo: "$", cifrasDecimales: 2 });
    });

    test("a la API: fecha AAAA-MM-DD y código en mayúsculas", () => {
        expect(cambiosDivisaAApi({ fecha: new Date(2026, 10, 10, 12), simbolo: " " })).toEqual({
            fecha: "2026-11-10", simbolo: null,
        });
        expect(nuevaDivisaAApi({ ...nuevoDivisaVacio(), id: " usd " })).toMatchObject({ id: "USD", tasa_conversion: 1 });
    });

    test("cambiosDivisa compara las fechas por valor", () => {
        const previa = { ...divisaVacio(), id: "USD", fecha: new Date(2026, 10, 10) };
        expect(cambiosDivisa(previa, { ...previa, fecha: new Date(2026, 10, 10) })).toEqual({});
        expect(cambiosDivisa(previa, { ...previa, tasaConversion: 1.1 })).toEqual({ tasaConversion: 1.1 });
    });
});

import { facturaVacia } from "#/compras/factura/detalle/detalle.ts";
import { EstadoExpedicion, Factura } from "#/compras/factura/diseño.ts";
import {
    estadoExpedicionDesdeApi,
    facturaRegistrable,
} from "#/compras/factura/dominio.ts";
import { describe, expect, test } from "vitest";

const conEstado = (estadoExpedicion: EstadoExpedicion): Factura => ({
    ...facturaVacia(),
    estadoExpedicion,
});

describe("registrar saca la factura de borrador", () => {
    test("se ofrece en BORRADOR", () => {
        expect(facturaRegistrable(conEstado("BORRADOR"))).toBe(true);
    });

    test("no se ofrece en lo que ya está registrado", () => {
        expect(facturaRegistrable(conEstado("REGISTRADA"))).toBe(false);
    });

    test("no se ofrece sin estado, que es la factura sin cargar", () => {
        expect(facturaRegistrable(facturaVacia())).toBe(false);
    });
});

describe("estados de expedición que llegan del servidor", () => {
    test("se normalizan a los códigos del dominio", () => {
        expect(estadoExpedicionDesdeApi("BORRADOR")).toBe("BORRADOR");
        expect(estadoExpedicionDesdeApi("REGISTRADA")).toBe("REGISTRADA");
    });

    test("se aceptan con otra caja o con espacios", () => {
        expect(estadoExpedicionDesdeApi("Borrador")).toBe("BORRADOR");
        expect(estadoExpedicionDesdeApi(" registrada ")).toBe("REGISTRADA");
    });

    test("lo que no se reconoce se queda sin estado", () => {
        expect(estadoExpedicionDesdeApi("")).toBe("");
        expect(estadoExpedicionDesdeApi(null)).toBe("");
        expect(estadoExpedicionDesdeApi(undefined)).toBe("");
        expect(estadoExpedicionDesdeApi("EMITIDA")).toBe("");
    });
});

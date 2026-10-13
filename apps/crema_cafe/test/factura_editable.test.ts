import { facturaVacia } from "#/ventas/factura/dominio.ts";
import { EstadoExpedicion } from "#/ventas/factura/diseño.ts";
import { FactoryObj } from "@olula/lib/factory_ctx.tsx";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import FactoryCremaCafe from "../src/factory.ts";
import { facturaEditable } from "#/ventas/factura/dominio.ts";

const conEstado = (estadoExpedicion: EstadoExpedicion) => ({ ...facturaVacia(), estadoExpedicion });
const whoami = (plugins: Record<string, string>) =>
    localStorage.setItem("whoami", JSON.stringify({ plugins }));

describe("crema_cafe: factura editable hasta firmada", () => {
    beforeEach(() => {
        localStorage.clear();
        FactoryObj.setApp(new FactoryCremaCafe() as unknown as Record<string, Record<string, unknown>>);
    });
    afterEach(() => FactoryObj.setApp({}));

    test("con firma: emitida editable, firmada no", () => {
        whoami({ estado_expedicion_factura: "firma" });
        expect(facturaEditable(conEstado("BORRADOR"))).toBe(true);
        expect(facturaEditable(conEstado("EMITIDA"))).toBe(true);
        expect(facturaEditable(conEstado("ERROR_FIRMA"))).toBe(true);
        expect(facturaEditable(conEstado("FIRMADA"))).toBe(false);
        expect(facturaEditable(facturaVacia())).toBe(false);
    });

    test("fallback: sin plugin en whoami solo el borrador", () => {
        whoami({});
        expect(facturaEditable(conEstado("EMITIDA"))).toBe(false);
        expect(facturaEditable(conEstado("BORRADOR"))).toBe(true);
    });
});

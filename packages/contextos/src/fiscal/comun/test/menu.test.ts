import { describe, expect, test } from "vitest";
import { menuFiscal } from "../../menu.ts";
import { RouterFactoryFiscalOlula } from "../../router_factory.ts";

describe("menú Fiscalidad", () => {
    test("está en el área Finanzas y cada entrada tiene su ruta", () => {
        expect(menuFiscal.Fiscalidad.area).toBe("Finanzas");
        const rutas = Object.keys(RouterFactoryFiscalOlula.router);
        for (const [clave, entrada] of Object.entries(menuFiscal)) {
            if (clave === "Fiscalidad") continue;
            expect(rutas).toContain((entrada as { url: string }).url.slice(1));
        }
        expect(Object.keys(menuFiscal)).toHaveLength(7);
    });
});

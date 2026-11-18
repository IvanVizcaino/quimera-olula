import { describe, expect, test } from "vitest";
import { menuContabilidad } from "#/contabilidad/menu.ts";
import { menuFiscal } from "#/fiscal/menu.ts";

describe("Ejercicios: Contabilidad y Fiscalidad son pantallas distintas", () => {
    test("Contabilidad > Apertura y Cierre de Ejercicio (A1)", () => {
        const menu = menuContabilidad as Record<string, { url?: string }>;
        expect(menu["Contabilidad/Apertura y Cierre de Ejercicio"]?.url).toBe("/contabilidad/ejercicio");
        expect(menu["Contabilidad/Ejercicios"]).toBeUndefined();
        expect(menuFiscal["Fiscalidad/Ejercicios fiscales"].url).toBe("/fiscal/ejercicio");
    });
});

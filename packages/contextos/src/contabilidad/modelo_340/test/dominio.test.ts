import { describe, expect, test } from "vitest";
import { nombreFicheroExportAeatModelo340 } from "../dominio.ts";

describe("modelo_340 dominio export AEAT", () => {
    test("nombreFicheroExportAeatModelo340 con ejercicio", () => {
        expect(nombreFicheroExportAeatModelo340("2024")).toBe("Resumen340_2024.340");
    });

    test("nombreFicheroExportAeatModelo340 fallback id modelo", () => {
        expect(nombreFicheroExportAeatModelo340("", 7)).toBe("Resumen340_7.340");
        expect(nombreFicheroExportAeatModelo340("  ", 7)).toBe("Resumen340_7.340");
    });
});

import { describe, expect, test } from "vitest";
import { nombreFicheroExportAeatModelo349 } from "../dominio.ts";

describe("modelo_349 dominio export AEAT", () => {
    test("nombreFicheroExportAeatModelo349 con ejercicio", () => {
        expect(nombreFicheroExportAeatModelo349("2025")).toBe("Resumen349_2025.349");
    });

    test("nombreFicheroExportAeatModelo349 fallback id modelo", () => {
        expect(nombreFicheroExportAeatModelo349("", 3)).toBe("Resumen349_3.349");
        expect(nombreFicheroExportAeatModelo349("  ", 3)).toBe("Resumen349_3.349");
    });
});

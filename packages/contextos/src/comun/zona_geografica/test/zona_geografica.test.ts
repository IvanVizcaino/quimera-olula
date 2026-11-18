import { describe, expect, test } from "vitest";
import { cambiosZonaGeografica, etiquetaZonaGeografica, zonaGeograficaVacio } from "../dominio.ts";
import { zonaGeograficaDesdeApi } from "../infraestructura.ts";

describe("zonas geográficas (zonasgeo)", () => {
    test("desde la API y etiqueta", () => {
        const zona = zonaGeograficaDesdeApi({ id: "EUR", descripcion: null });
        expect(zona.descripcion).toBe("");
        expect(etiquetaZonaGeografica({ id: "EUR", descripcion: "Europa" })).toBe("EUR — Europa");
    });

    test("solo cambia la descripción", () => {
        const previa = { ...zonaGeograficaVacio(), id: "EUR" };
        expect(cambiosZonaGeografica(previa, previa)).toEqual({});
        expect(cambiosZonaGeografica(previa, { ...previa, descripcion: "Europa" })).toEqual({ descripcion: "Europa" });
    });
});

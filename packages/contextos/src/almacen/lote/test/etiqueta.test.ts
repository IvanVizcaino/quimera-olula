import { describe, expect, it } from "vitest";
import { formEtiquetaPorDefecto, nombreEtiquetaLote, opcionesEtiquetaDesdeForm, queryEtiquetaLote } from "../dominio.ts";
import { urlEtiquetaLote } from "../infraestructura.ts";

describe("etiquetas de lote", () => {
    it("por defecto, una copia en 3x9 y sin cantidad", () => {
        expect(formEtiquetaPorDefecto()).toEqual({ copias: "1", formato: "3x9", cantidad: "" });
        expect(opcionesEtiquetaDesdeForm(formEtiquetaPorDefecto())).toEqual({ copias: 1, formato: "3x9", cantidad: null });
    });

    it("valida copias y cantidad", () => {
        const base = formEtiquetaPorDefecto();
        expect(opcionesEtiquetaDesdeForm({ ...base, copias: "0" })).toMatch(/copias/);
        expect(opcionesEtiquetaDesdeForm({ ...base, copias: "501" })).toMatch(/copias/);
        expect(opcionesEtiquetaDesdeForm({ ...base, copias: "1,5" })).toMatch(/copias/);
        expect(opcionesEtiquetaDesdeForm({ ...base, cantidad: "abc" })).toMatch(/cantidad/);
        expect(opcionesEtiquetaDesdeForm({ ...base, cantidad: "-1" })).toMatch(/cantidad/);
        expect(opcionesEtiquetaDesdeForm({ copias: "3", formato: "2,5x6", cantidad: "1.234,5" }))
            .toEqual({ copias: 3, formato: "2,5x6", cantidad: 1234.5 });
        expect(opcionesEtiquetaDesdeForm({ ...base, cantidad: "12.5" })).toMatchObject({ cantidad: 12.5 });
    });

    it("construye la URL", () => {
        expect(queryEtiquetaLote({ copias: 1, formato: "3x9", cantidad: null })).toBe("copias=1&formato=3x9");
        expect(urlEtiquetaLote("LS 1", { copias: 2, formato: "2,5x6", cantidad: 7.5 }))
            .toBe("/almacen/lote/LS%201/etiqueta?copias=2&formato=2%2C5x6&cantidad=7.5");
        expect(nombreEtiquetaLote("LS00000001")).toBe("etiqueta-lote-LS00000001.pdf");
    });
});

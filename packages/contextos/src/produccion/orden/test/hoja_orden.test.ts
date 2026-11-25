import { describe, expect, it } from "vitest";
import { motivoRangoHojasNoValido, nombreHojaOrden } from "../dominio.ts";
import { urlHojaOrden } from "../infraestructura.ts";

describe("hoja de orden", () => {
    it("URL de una orden y de un rango", () => {
        expect(urlHojaOrden("OP00000001")).toBe("/produccion/orden/OP00000001/report");
        expect(urlHojaOrden("OP00000001", "")).toBe("/produccion/orden/OP00000001/report");
        expect(urlHojaOrden(" OP00000001 ", "OP00000001")).toBe("/produccion/orden/OP00000001/report");
        expect(urlHojaOrden("OP00000001", "OP00000009")).toBe("/produccion/orden/OP00000001/report?hasta=OP00000009");
    });

    it("nombre del PDF como el del servidor", () => {
        expect(nombreHojaOrden("OP00000001")).toBe("orden-OP00000001.pdf");
        expect(nombreHojaOrden("OP00000001", "OP00000003")).toBe("ordenes-OP00000001-OP00000003.pdf");
    });

    it("rango: desde obligatorio y hasta no anterior", () => {
        expect(motivoRangoHojasNoValido("", "")).toMatch(/desde/);
        expect(motivoRangoHojasNoValido("OP00000005", "OP00000001")).toMatch(/anterior/);
        expect(motivoRangoHojasNoValido("OP00000001", "")).toBeNull();
        expect(motivoRangoHojasNoValido("OP00000001", "OP00000005")).toBeNull();
    });
});

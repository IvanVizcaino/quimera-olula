import { describe, expect, it } from "vitest";
import { validarSeccion } from "../dominio.ts";
import { validarTipoCentroCoste } from "../../tipo_centro_coste/dominio.ts";

describe("secciones y tipos de centro de coste", () => {
    it("aplican las longitudes de su .mtd", () => {
        expect(validarSeccion({ id: "S1", descripcion: "Corte" })).toBe(true);
        expect(validarSeccion({ id: "12345678901", descripcion: "Corte" })).not.toBe(true);
        expect(validarSeccion({ id: "S1", descripcion: "x".repeat(51) })).not.toBe(true);
        expect(validarTipoCentroCoste({ id: "x".repeat(25), descripcion: "x".repeat(100) })).toBe(true);
        expect(validarTipoCentroCoste({ id: "x".repeat(26), descripcion: "Tipo" })).not.toBe(true);
    });
});

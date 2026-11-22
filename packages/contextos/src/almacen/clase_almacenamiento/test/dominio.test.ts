import { describe, expect, it } from "vitest";
import { nuevaClaseAlmacenamientoVacia, validarClaseAlmacenamiento } from "../dominio.ts";

const valida = { ...nuevaClaseAlmacenamientoVacia, codigo: "APQ", descripcion: "Producto químico (APQ)" };

describe("validarClaseAlmacenamiento", () => {
    it("acepta una clase correcta", () => {
        expect(validarClaseAlmacenamiento(valida)).toBe(true);
    });

    it("rechaza código vacío o solo espacios", () => {
        expect(validarClaseAlmacenamiento({ ...valida, codigo: "" })).not.toBe(true);
        expect(validarClaseAlmacenamiento({ ...valida, codigo: "  " })).not.toBe(true);
        expect(validarClaseAlmacenamiento({ ...valida, codigo: null as unknown as string })).not.toBe(true);
        expect(validarClaseAlmacenamiento({ ...valida, descripcion: null as unknown as string })).not.toBe(true);
    });

    it("rechaza código de más de 10 caracteres", () => {
        expect(validarClaseAlmacenamiento({ ...valida, codigo: "12345678901" })).not.toBe(true);
        expect(validarClaseAlmacenamiento({ ...valida, codigo: "1234567890" })).toBe(true);
    });

    it("rechaza descripción vacía", () => {
        expect(validarClaseAlmacenamiento({ ...valida, descripcion: "" })).not.toBe(true);
    });
});

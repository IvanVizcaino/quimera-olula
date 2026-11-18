import { describe, expect, it } from "vitest";
import {
    enteroNoNegativoONulo,
    nuevoTipoUbicacionVacio,
    numeroNoNegativoONulo,
    validarTipoUbicacion,
} from "../dominio.ts";

const valido = { ...nuevoTipoUbicacionVacio, codigo: "PAL", descripcion: "Hueco de palé" };

describe("validarTipoUbicacion", () => {
    it("acepta un tipo correcto con opcionales vacíos", () => {
        expect(validarTipoUbicacion(valido)).toBe(true);
    });

    it("acepta opcionales a cero", () => {
        expect(validarTipoUbicacion({ ...valido, capacidadPalets: 0, pesoMax: 0, alturaMax: 0 })).toBe(true);
    });

    it("rechaza código o descripción vacíos", () => {
        expect(validarTipoUbicacion({ ...valido, codigo: "" })).not.toBe(true);
        expect(validarTipoUbicacion({ ...valido, descripcion: "" })).not.toBe(true);
        // useModelo deja en null el campo que se borra
        expect(validarTipoUbicacion({ ...valido, codigo: null as unknown as string })).not.toBe(true);
        expect(validarTipoUbicacion({ ...valido, descripcion: null as unknown as string })).not.toBe(true);
    });

    it("rechaza código de más de 10 caracteres", () => {
        expect(validarTipoUbicacion({ ...valido, codigo: "12345678901" })).not.toBe(true);
    });

    it("rechaza capacidad, peso o altura negativos", () => {
        expect(validarTipoUbicacion({ ...valido, capacidadPalets: -1 })).not.toBe(true);
        expect(validarTipoUbicacion({ ...valido, pesoMax: -0.5 })).not.toBe(true);
        expect(validarTipoUbicacion({ ...valido, alturaMax: -1 })).not.toBe(true);
    });

    it("rechaza capacidad no entera", () => {
        expect(validarTipoUbicacion({ ...valido, capacidadPalets: 1.5 })).not.toBe(true);
    });
});

describe("numeroNoNegativoONulo / enteroNoNegativoONulo", () => {
    it("nulo es válido", () => {
        expect(numeroNoNegativoONulo(null)).toBe(true);
        expect(enteroNoNegativoONulo(null)).toBe(true);
    });

    it("distingue enteros de decimales", () => {
        expect(numeroNoNegativoONulo(1.8)).toBe(true);
        expect(enteroNoNegativoONulo(1.8)).toBe(false);
    });

    it("rechaza NaN e infinito", () => {
        expect(numeroNoNegativoONulo(NaN)).toBe(false);
        expect(numeroNoNegativoONulo(Infinity)).toBe(false);
    });
});

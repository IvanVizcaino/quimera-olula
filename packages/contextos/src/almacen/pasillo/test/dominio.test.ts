import { describe, expect, it } from "vitest";
import { ParametrosGenerarUbicaciones } from "../diseño.ts";
import {
    caraDeModulo,
    mensajeUbicacionesGeneradas,
    modulosValidosPasillo,
    parametrosGenerarUbicacionesIniciales,
    validarGenerarUbicaciones,
    validarPasillo,
} from "../dominio.ts";

const params = (cambios: Partial<ParametrosGenerarUbicaciones>): ParametrosGenerarUbicaciones => ({
    ...parametrosGenerarUbicacionesIniciales,
    ...cambios,
});

describe("validarGenerarUbicaciones", () => {
    it("acepta los valores iniciales", () => {
        expect(validarGenerarUbicaciones(parametrosGenerarUbicacionesIniciales)).toBe(true);
    });

    it("acepta nivel_hasta igual o mayor que nivel_desde", () => {
        expect(validarGenerarUbicaciones(params({ nivelDesde: 1, nivelHasta: 1 }))).toBe(true);
        expect(validarGenerarUbicaciones(params({ nivelDesde: 0, nivelHasta: 3 }))).toBe(true);
    });

    it("rechaza nivel_hasta menor que nivel_desde", () => {
        expect(validarGenerarUbicaciones(params({ nivelDesde: 2, nivelHasta: 1 }))).not.toBe(true);
    });

    it("rechaza niveles negativos, nulos o no enteros", () => {
        expect(validarGenerarUbicaciones(params({ nivelDesde: -1 }))).not.toBe(true);
        expect(validarGenerarUbicaciones(params({ nivelHasta: null }))).not.toBe(true);
        expect(validarGenerarUbicaciones(params({ nivelDesde: null }))).not.toBe(true);
        expect(validarGenerarUbicaciones(params({ nivelDesde: 0.5, nivelHasta: 2 }))).not.toBe(true);
    });

    it("exige huecos por nivel >= 1", () => {
        expect(validarGenerarUbicaciones(params({ huecosPorNivel: 0 }))).not.toBe(true);
        expect(validarGenerarUbicaciones(params({ huecosPorNivel: null }))).not.toBe(true);
        expect(validarGenerarUbicaciones(params({ huecosPorNivel: 1 }))).toBe(true);
    });

    it("exige módulos > 0 cuando se indican", () => {
        expect(validarGenerarUbicaciones(params({ moduloDesde: 0 }))).not.toBe(true);
        expect(validarGenerarUbicaciones(params({ moduloHasta: -2 }))).not.toBe(true);
        expect(validarGenerarUbicaciones(params({ moduloDesde: 1, moduloHasta: 4 }))).toBe(true);
    });

    it("acepta un solo extremo de módulos", () => {
        expect(validarGenerarUbicaciones(params({ moduloDesde: 3 }))).toBe(true);
        expect(validarGenerarUbicaciones(params({ moduloHasta: 3 }))).toBe(true);
    });

    it("rechaza módulo_hasta menor que módulo_desde", () => {
        expect(validarGenerarUbicaciones(params({ moduloDesde: 5, moduloHasta: 2 }))).not.toBe(true);
    });
});

describe("validarPasillo", () => {
    const valido = { codigo: "A", orden: 0, modulos: 8 };

    it("acepta un pasillo correcto", () => {
        expect(validarPasillo(valido)).toBe(true);
    });

    it("rechaza código vacío o de más de 10 caracteres", () => {
        expect(validarPasillo({ ...valido, codigo: " " })).not.toBe(true);
        expect(validarPasillo({ ...valido, codigo: null as unknown as string })).not.toBe(true);
        expect(validarPasillo({ ...valido, codigo: "12345678901" })).not.toBe(true);
    });

    it("rechaza orden negativo o nulo", () => {
        expect(validarPasillo({ ...valido, orden: -1 })).not.toBe(true);
        expect(validarPasillo({ ...valido, orden: null })).not.toBe(true);
    });

    it("rechaza módulos <= 0 o nulos", () => {
        expect(validarPasillo({ ...valido, modulos: 0 })).not.toBe(true);
        expect(validarPasillo({ ...valido, modulos: null })).not.toBe(true);
    });
});

describe("modulosValidosPasillo", () => {
    it("AMBAS: 1..2n", () => {
        expect(modulosValidosPasillo("AMBAS", 3)).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it("IZQUIERDA: impares hasta 2n-1", () => {
        expect(modulosValidosPasillo("IZQUIERDA", 3)).toEqual([1, 3, 5]);
    });

    it("DERECHA: pares hasta 2n", () => {
        expect(modulosValidosPasillo("DERECHA", 3)).toEqual([2, 4, 6]);
    });

    it("sin módulos válidos si n no es positivo", () => {
        expect(modulosValidosPasillo("AMBAS", 0)).toEqual([]);
    });
});

describe("caraDeModulo y mensaje", () => {
    it("impar es izquierda y par derecha", () => {
        expect(caraDeModulo(7)).toBe("IZQUIERDA");
        expect(caraDeModulo(8)).toBe("DERECHA");
    });

    it("mensaje de ubicaciones creadas", () => {
        expect(mensajeUbicacionesGeneradas(0)).toContain("ninguna");
        expect(mensajeUbicacionesGeneradas(1)).toContain("1 ubicación");
        expect(mensajeUbicacionesGeneradas(24)).toContain("24 ubicaciones");
    });
});

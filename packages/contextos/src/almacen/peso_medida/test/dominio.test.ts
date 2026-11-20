import { describe, expect, it } from "vitest";
import { cambiosPesoMedidaAApi, pesoMedidaDesdeApi } from "../infraestructura.ts";
import { nuevoPesoMedidaVacio, validarPesoMedida } from "../dominio.ts";

const valida = { ...nuevoPesoMedidaVacio, id: "KG", descripcion: "Kilogramos", factorConversion: 1000 };

describe("validarPesoMedida", () => {
    it("acepta una unidad correcta", () => {
        expect(validarPesoMedida(valida)).toBe(true);
    });

    it("exige abreviatura de 1 a 10 caracteres y descripción", () => {
        expect(validarPesoMedida({ ...valida, id: " " })).not.toBe(true);
        expect(validarPesoMedida({ ...valida, id: "12345678901" })).not.toBe(true);
        expect(validarPesoMedida({ ...valida, descripcion: "" })).not.toBe(true);
    });

    it("rechaza factor negativo", () => {
        expect(validarPesoMedida({ ...valida, factorConversion: -1 })).not.toBe(true);
        expect(validarPesoMedida({ ...valida, factorConversion: 0 })).toBe(true);
    });
});

describe("API de pesos y medidas", () => {
    it("convierte desde y hacia la API", () => {
        expect(pesoMedidaDesdeApi({ id: "M", descripcion: "Metros", magnitud: "Longitud", factor_conversion: null }))
            .toEqual({ id: "M", descripcion: "Metros", magnitud: "Longitud", factorConversion: 0 });
        expect(cambiosPesoMedidaAApi({ magnitud: "", factorConversion: 2.5 }))
            .toEqual({ magnitud: null, factor_conversion: 2.5 });
    });
});

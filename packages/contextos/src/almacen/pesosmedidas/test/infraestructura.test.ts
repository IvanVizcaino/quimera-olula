import { describe, expect, test } from "vitest";
import {
    unidadMedidaAApiParaTest,
    unidadMedidaDesdeApiParaTest,
} from "../infraestructura.ts";

describe("pesosmedidas infraestructura (T2.7)", () => {
    test("unidadMedidaDesdeApi mapea snake_case a camelCase", () => {
        expect(
            unidadMedidaDesdeApiParaTest({
                id: "KG",
                descripcion: "Kilogramo",
                magnitud: "Peso",
                factor_conv: 1,
            }),
        ).toEqual({
            id: "KG",
            descripcion: "Kilogramo",
            magnitud: "Peso",
            factorConv: 1,
        });
    });

    test("unidadMedidaAApi envía factor_conv al PATCH", () => {
        expect(
            unidadMedidaAApiParaTest({
                descripcion: "Gramo",
                factorConv: 0.001,
            }),
        ).toEqual({
            descripcion: "Gramo",
            factor_conv: 0.001,
        });
    });
});

import { describe, expect, test } from "vitest";
import {
    componenteAApiParaTest,
    composicionDesdeApiParaTest,
    cuerpoPatchParaTest,
} from "../infraestructura.ts";

describe("articulo_compuesto infraestructura (T2.6)", () => {
    test("composicionDesdeApi filtra opciones variables y mapea campos", () => {
        expect(
            composicionDesdeApiParaTest({
                articulo_id: "KIT1",
                componentes: [
                    {
                        id: "1",
                        articulo_id: "A",
                        cantidad: 2,
                        unidad_id: "KG",
                        id_tipo_opcion_art: null,
                    },
                    {
                        id: "2",
                        articulo_id: "B",
                        cantidad: 1,
                        id_tipo_opcion_art: 3,
                    },
                ],
            }),
        ).toEqual({
            articuloId: "KIT1",
            stockPorComponentes: false,
            componentes: [
                {
                    id: "1",
                    articuloId: "A",
                    descripcionArticulo: undefined,
                    cantidad: 2,
                    unidadId: "KG",
                    descripcionUnidad: undefined,
                },
            ],
        });
    });

    test("componenteAApi fuerza id_tipo_opcion_art null en PATCH", () => {
        expect(
            componenteAApiParaTest({
                id: "",
                articuloId: "REF",
                cantidad: 4,
                unidadId: "UD",
            }),
        ).toEqual({
            id: null,
            articulo_id: "REF",
            cantidad: 4,
            unidad_id: "UD",
            id_tipo_opcion_art: null,
        });
    });
});

describe("articulo_compuesto stockcomp (T2.6 cierre 2026-10-08)", () => {
    test("composicionDesdeApi lee stock_por_componentes (false si falta)", () => {
        expect(
            composicionDesdeApiParaTest({ articulo_id: "K", stock_por_componentes: true, componentes: [] })
                .stockPorComponentes,
        ).toBe(true);
        expect(
            composicionDesdeApiParaTest({ articulo_id: "K", componentes: [] }).stockPorComponentes,
        ).toBe(false);
    });

    test("PATCH solo envía stock_por_componentes al activarlo (irreversible)", () => {
        expect(cuerpoPatchParaTest([], true)).toEqual({ componentes: [], stock_por_componentes: true });
        expect(cuerpoPatchParaTest([], false)).toEqual({ componentes: [] });
        expect(cuerpoPatchParaTest([])).toEqual({ componentes: [] });
    });
});

import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { afterEach, describe, expect, test, vi } from "vitest";
import {
    peticionAApiParaTest,
    postRegenerarMovimientos,
    resumenDesdeApiParaTest,
} from "../infraestructura.ts";

afterEach(() => vi.restoreAllMocks());

describe("regenera_movimientos infraestructura", () => {
    test("peticionAApi envía almacen_id y solo los filtros informados", () => {
        expect(peticionAApiParaTest({ almacenId: "ALG", articulos: ["A"] })).toEqual({
            almacen_id: "ALG",
            articulos: ["A"],
        });
        expect(peticionAApiParaTest({ almacenId: "ALG", familiaId: "F" })).toEqual({
            almacen_id: "ALG",
            familia_id: "F",
        });
    });

    test("resumenDesdeApi mapea stocks_revisados y por_documento", () => {
        expect(
            resumenDesdeApiParaTest({
                articulos: 2,
                lineas: 5,
                stocks_revisados: 3,
                por_documento: { pedidoscli: 2, albaranescli: 3 },
            }),
        ).toEqual({
            articulos: 2,
            lineas: 5,
            stocksRevisados: 3,
            porDocumento: { pedidoscli: 2, albaranescli: 3 },
        });
    });

    test("postRegenerarMovimientos hace POST a /almacen/regenera_movimientos y acepta {datos}", async () => {
        const query = vi.spyOn(RestAPI, "query").mockResolvedValue({
            datos: { articulos: 1, lineas: 0, stocks_revisados: 1, por_documento: {} },
        });
        const r = await postRegenerarMovimientos({ almacenId: "ALG", articulos: ["A"] });
        expect(query).toHaveBeenCalledWith(
            "/almacen/regenera_movimientos",
            { almacen_id: "ALG", articulos: ["A"] },
            expect.any(String),
        );
        expect(r.stocksRevisados).toBe(1);
    });
});

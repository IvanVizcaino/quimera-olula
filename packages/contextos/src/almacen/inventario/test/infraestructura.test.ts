import { describe, expect, test } from "vitest";
import {
    inventarioDesdeApi,
    itemInventarioDesdeApi,
    lineaInventarioDesdeApi,
    resultadoImportarCsvDesdeApi,
    resultadoInventarioTotalDesdeApi,
    resultadoRestoACeroDesdeApi,
} from "../infraestructura.ts";

describe("mappers inventario API", () => {
    test("inventarioDesdeApi mapea snake_case, fecha y cerrado", () => {
        const inv = inventarioDesdeApi({
            id: "INV2026",
            almacen_id: "01",
            fecha: "2026-03-17",
            hora: null,
            observaciones: "Recuento anual",
            cerrado: true,
        });

        expect(inv.id).toBe("INV2026");
        expect(inv.almacenId).toBe("01");
        expect(inv.observaciones).toBe("Recuento anual");
        expect(inv.cerrado).toBe(true);
        expect(inv.fecha.getFullYear()).toBe(2026);
    });

    test("itemInventarioDesdeApi omite hora y cerrado por defecto false", () => {
        const item = itemInventarioDesdeApi({
            id: "X",
            almacen_id: "02",
            fecha: "2026-01-01",
            hora: "10:00:00",
            observaciones: null,
        });
        expect(item.almacenId).toBe("02");
        expect(item.observaciones).toBe("");
        expect(item.cerrado).toBe(false);
    });

    test("lineaInventarioDesdeApi mapea cantidades y codlote", () => {
        const linea = lineaInventarioDesdeApi({
            id: 42,
            inventario_id: "INV",
            stock_id: 7,
            referencia: "CAFE01",
            descripcion: "Café",
            cantidad_ini: 10,
            cantidad_fin: 12.5,
            codlote: "1L123",
        });

        expect(linea.id).toBe("42");
        expect(linea.cantidadIni).toBe(10);
        expect(linea.cantidadFin).toBe(12.5);
        expect(linea.descripcion).toBe("Café");
        expect(linea.codlote).toBe("1L123");
    });

    test("resultadoImportarCsvDesdeApi", () => {
        expect(
            resultadoImportarCsvDesdeApi({
                inventario_id: "INV1",
                lecturas_importadas: 100,
                lineas_actualizadas: 95,
            })
        ).toEqual({
            inventarioId: "INV1",
            lecturasImportadas: 100,
            lineasActualizadas: 95,
        });
    });

    test("resultadoRestoACeroDesdeApi", () => {
        expect(
            resultadoRestoACeroDesdeApi({
                inventario_id: "INV1",
                lineas_creadas: 50,
                saltados_por_lotes: 3,
            })
        ).toEqual({
            inventarioId: "INV1",
            lineasCreadas: 50,
            saltadosPorLotes: 3,
        });
    });

    test("resultadoInventarioTotalDesdeApi", () => {
        expect(
            resultadoInventarioTotalDesdeApi({
                inventario_id: "TOT1",
                lineas_creadas: 200,
                saltados_por_lotes: 1,
            })
        ).toEqual({
            inventarioId: "TOT1",
            lineasCreadas: 200,
            saltadosPorLotes: 1,
        });
    });
});

import { describe, expect, it } from "vitest";
import { etiquetaEstadoLote, fechaDdMmAaaa, formatearCantidad, mensajeRevisados, textoArticulo, tituloLote } from "../dominio.ts";
import { loteDesdeApi, revisadosDesdeApi } from "../infraestructura.ts";

describe("lote: conversores", () => {
    it("sin el plugin de producción no hay ficha de producción", () => {
        expect(loteDesdeApi({
            id: "L1", sku: "HILO", articulo: "Hilo", caducidad: "2027-01-31", en_almacen: "12.5",
            estado: null, cantidad_programada: null, orden_id: null,
        })).toEqual({ id: "L1", sku: "HILO", articulo: "Hilo", caducidad: "2027-01-31", enAlmacen: 12.5, produccion: null });
        // Una API anterior a F8 (sin artículo ni en_almacen) también se lee.
        expect(loteDesdeApi({ id: "L2", sku: "HILO", caducidad: null }))
            .toEqual({ id: "L2", sku: "HILO", articulo: "", caducidad: "", enAlmacen: 0, produccion: null });
    });

    it("con el plugin lee la ficha de producción (vacíos en texto, números)", () => {
        expect(loteDesdeApi({
            id: "LS00000001", sku: "TELA", articulo: "Tela", caducidad: null, en_almacen: 8,
            estado: "PTE", cantidad_programada: 10, cantidad_lote: "10", cantidad_total: 8, cantidad_usada: 0,
            cantidad_reservada: 1.5, cantidad_por_recibir: 2, cantidad_disponible: 6.5, orden_id: "OP00000001",
            fecha_fabricacion: "2026-11-25", cliente_id: null, cliente: null,
        }).produccion).toEqual({
            estado: "PTE", cantidadProgramada: 10, cantidadLote: 10, cantidadTotal: 8, cantidadUsada: 0,
            cantidadReservada: 1.5, cantidadPorRecibir: 2, cantidadDisponible: 6.5, ordenId: "OP00000001",
            fechaFabricacion: "2026-11-25", clienteId: "", cliente: "",
        });
    });

    it("lee cuántos lotes se han revisado", () => {
        expect(revisadosDesdeApi({ revisados: 3 })).toBe(3);
        expect(revisadosDesdeApi(null)).toBe(0);
    });
});

describe("lote: dominio", () => {
    it("etiqueta el estado", () => {
        expect(etiquetaEstadoLote("PTE")).toEqual({ texto: "Pendiente", tono: "pendiente" });
        expect(etiquetaEstadoLote("TERMINADO")).toEqual({ texto: "Terminado", tono: "completado" });
        expect(etiquetaEstadoLote(null)).toEqual({ texto: "—", tono: "borrador" });
    });

    it("formatea fechas y cantidades en español", () => {
        expect(fechaDdMmAaaa("2027-01-31")).toBe("31/01/2027");
        expect(fechaDdMmAaaa("")).toBe("");
        expect(formatearCantidad(12500.125)).toBe("12.500,125");
        expect(formatearCantidad(null)).toBe("");
    });

    it("titula y nombra el artículo", () => {
        const lote = { id: "L1", sku: "HILO", articulo: "Hilo", caducidad: "", enAlmacen: 0, produccion: null };
        expect(tituloLote(lote)).toBe("L1 · Hilo");
        expect(textoArticulo(lote)).toBe("HILO - Hilo");
        expect(textoArticulo({ sku: "HILO", articulo: "" })).toBe("HILO");
        expect(mensajeRevisados(1)).toBe("Se ha revisado 1 lote.");
        expect(mensajeRevisados(1200)).toBe("Se han revisado 1200 lotes.");
    });
});

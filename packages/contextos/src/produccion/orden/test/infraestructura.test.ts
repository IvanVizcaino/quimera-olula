import { describe, expect, it } from "vitest";
import {
    cambiosLoteAApi,
    cambiosOrdenAApi,
    loteAApi,
    nuevaOrdenAApi,
    ordenDesdeApi,
} from "../infraestructura.ts";

describe("orden de producción: conversores", () => {
    it("lee la orden con su lote (vacíos en texto, fechas AAAA-MM-DD)", () => {
        const orden = ordenDesdeApi({
            id: "OP00000001", fecha: "2026-11-24", fecha_entrega: null, estado: "PTE", descripcion: null,
            observaciones: null, pedido_id: null, cliente_id: "000001", cliente: "Cliente", total_lotes: 1, total_uds: 12.5,
            lotes: [{
                id: "LS00000001", articulo_id: "CAMISA", descripcion: "Camisa", cantidad: 12.5, cantidad_programada: 12.5,
                cantidad_total: 0, estado: "PTE", fecha_fabricacion: "2026-12-14", cliente_id: null, linea_pedido_id: 7,
            }],
            tareas: [],
        });
        expect(orden).toMatchObject({
            id: "OP00000001", fecha: "2026-11-24", fechaEntrega: "", estado: "PTE", descripcion: "", observaciones: "",
            pedidoId: "", clienteId: "000001", cliente: "Cliente", totalLotes: 1, totalUds: 12.5, tareas: [],
        });
        expect(orden.lotes[0]).toEqual({
            id: "LS00000001", articuloId: "CAMISA", descripcion: "Camisa", cantidad: 12.5, cantidadProgramada: 12.5,
            cantidadTotal: 0, estado: "PTE", fechaFabricacion: "2026-12-14", clienteId: "", lineaPedidoId: "7",
        });
    });

    it("lee la orden de la lista (sin lotes ni observaciones) y la de los comandos (sin cliente)", () => {
        const lista = ordenDesdeApi({
            id: "OP1", fecha: "2026-11-24", fecha_entrega: "2026-12-01", estado: "EN CURSO", descripcion: "D",
            pedido_id: "20260A000001", cliente_id: null, total_lotes: null, total_uds: null,
        });
        expect(lista).toMatchObject({ estado: "EN CURSO", fechaEntrega: "2026-12-01", pedidoId: "20260A000001", cliente: "", totalLotes: 0, totalUds: 0, lotes: [] });
    });

    it("tareas: lo que venga, con id, descripción y estado en texto", () => {
        const orden = ordenDesdeApi({
            id: "OP1", fecha: "2026-11-24", fecha_entrega: null, estado: "PTE", descripcion: null, pedido_id: null,
            cliente_id: null, total_lotes: 0, total_uds: 0, tareas: [{ id: 5, descripcion: "Cortar", estado: "PTE", extra: 1 }, {}],
        });
        expect(orden.tareas[0]).toMatchObject({ id: "5", descripcion: "Cortar", estado: "PTE", extra: 1 });
        expect(orden.tareas[1]).toMatchObject({ id: "1", descripcion: "", estado: "" });
    });

    it("cambios de cabecera: solo los presentes; vacío es null salvo la fecha", () => {
        expect(cambiosOrdenAApi({ descripcion: "" })).toEqual({ descripcion: null });
        expect(cambiosOrdenAApi({ fecha: "2026-11-25", fechaEntrega: "", clienteId: "000001", pedidoId: "" }))
            .toEqual({ fecha: "2026-11-25", fecha_entrega: null, cliente_id: "000001", pedido_id: null });
        expect(cambiosOrdenAApi({ observaciones: " nota " })).toEqual({ observaciones: "nota" });
        expect(cambiosOrdenAApi({})).toEqual({});
    });

    it("alta con su lote (sin fecha de fabricación si está vacía)", () => {
        expect(nuevaOrdenAApi({
            fecha: "2026-11-24", fechaEntrega: "", descripcion: "Urgente", articuloId: " CAMISA ", cantidad: "12,5", fechaFabricacion: "",
        })).toEqual({ fecha: "2026-11-24", descripcion: "Urgente", lote: { articulo_id: "CAMISA", cantidad: 12.5 } });
        expect(loteAApi({ articuloId: "CAMISA", cantidad: 3, fechaFabricacion: "2026-12-01" }))
            .toEqual({ articulo_id: "CAMISA", cantidad: 3, fecha_fabricacion: "2026-12-01" });
    });

    it("cambios del lote", () => {
        expect(cambiosLoteAApi({ cantidad: 4 })).toEqual({ cantidad: 4 });
        expect(cambiosLoteAApi({ fechaFabricacion: "" })).toEqual({ fecha_fabricacion: null });
    });
});

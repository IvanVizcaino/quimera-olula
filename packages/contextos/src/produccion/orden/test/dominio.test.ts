import { describe, expect, it } from "vitest";
import { AccionesCicloVida } from "../../comun/ciclo_vida.ts";
import { LoteOrden, OrdenProduccion } from "../diseño.ts";
import {
    campoOrdenEditable,
    cambiosLote,
    cambiosOrden,
    cantidadDesdeTexto,
    cantidadParaEditar,
    formDesdeLote,
    etiquetaEstadoOrden,
    fechaFabricacionPorDefecto,
    filtroPedidosCliente,
    formatearCantidad,
    loteUnico,
    nuevaOrdenVacia,
    ordenVacia,
    puedeAnadirLote,
    tituloOrden,
    validarFormLote,
    validarNuevaOrden,
    validarOrden,
} from "../dominio.ts";

const lote = (id: string, cantidad = 10): LoteOrden => ({
    id, articuloId: "CAMISA", descripcion: "Camisa", cantidad, cantidadProgramada: cantidad, cantidadTotal: 0,
    estado: "PTE", fechaFabricacion: "2026-12-14", clienteId: "", lineaPedidoId: "",
});

const orden = (cambios: Partial<OrdenProduccion> = {}): OrdenProduccion => ({
    ...ordenVacia(), id: "OP00000001", fecha: "2026-11-24", ...cambios,
});

const acciones = (cabe: Record<string, boolean>, permitido: boolean | null = true): AccionesCicloVida => ({
    estado: "PTE",
    etiqueta: "Pendiente",
    acciones: Object.entries(cabe).map(([comando, c]) => ({ comando, cabe: c, condicion: null, motivo: c ? null : "No está PTE", permitido })),
});

describe("orden de producción: formato", () => {
    it("cantidades en español con hasta 3 decimales", () => {
        expect(formatearCantidad(12345.6789)).toBe("12.345,679");
        expect(formatearCantidad(2.5)).toBe("2,5");
        expect(formatearCantidad(10)).toBe("10");
        expect(formatearCantidad(null)).toBe("");
    });

    it("lee cantidades con coma o punto decimal", () => {
        expect(cantidadDesdeTexto("12,5")).toBe(12.5);
        expect(cantidadDesdeTexto("1.234,25")).toBe(1234.25);
        expect(cantidadDesdeTexto("7.5")).toBe(7.5);
        expect(cantidadDesdeTexto(3)).toBe(3);
        expect(cantidadDesdeTexto("")).toBeNull();
        expect(cantidadDesdeTexto("abc")).toBeNull();
    });

    it("cantidad para editar con coma y sin miles, y se relee igual", () => {
        expect(cantidadParaEditar(12345.5)).toBe("12345,5");
        expect(cantidadDesdeTexto(cantidadParaEditar(12345.5))).toBe(12345.5);
        expect(cantidadDesdeTexto(cantidadParaEditar(12345))).toBe(12345);
        expect(formDesdeLote(lote("LS1", 20.125)).cantidad).toBe("20,125");
    });

    it("estados con su tono", () => {
        expect(etiquetaEstadoOrden("PTE")).toEqual({ texto: "Pendiente", tono: "pendiente" });
        expect(etiquetaEstadoOrden("EN CURSO")).toEqual({ texto: "En curso", tono: "parcial" });
        expect(etiquetaEstadoOrden("TERMINADA")).toEqual({ texto: "Terminada", tono: "completado" });
        expect(etiquetaEstadoOrden("OTRO").tono).toBe("borrador");
    });

    it("título con la descripción o, si no hay, el artículo del lote", () => {
        expect(tituloOrden(orden({ descripcion: "Pedido urgente" }))).toBe("OP00000001 · Pedido urgente");
        expect(tituloOrden(orden({ lotes: [lote("LS1")] }))).toBe("OP00000001 · Camisa");
        expect(tituloOrden(orden())).toBe("OP00000001");
    });
});

describe("orden de producción: alta y validación", () => {
    it("el alta pide fecha, artículo y cantidad positiva", () => {
        const vacia = nuevaOrdenVacia(new Date(2026, 10, 24));
        expect(vacia.fecha).toBe("2026-11-24");
        expect(validarNuevaOrden(vacia)).toBe("El artículo es obligatorio");
        expect(validarNuevaOrden({ ...vacia, articuloId: "CAMISA" })).toBe("La cantidad es obligatoria");
        expect(validarNuevaOrden({ ...vacia, articuloId: "CAMISA", cantidad: "0" })).toBe("La cantidad ha de ser mayor que cero");
        expect(validarNuevaOrden({ ...vacia, articuloId: "CAMISA", cantidad: "1,2345" }))
            .toBe("La cantidad admite como máximo 3 decimales");
        expect(validarNuevaOrden({ ...vacia, articuloId: "CAMISA", cantidad: "12,5" })).toBe(true);
    });

    it("la entrega no puede ser anterior a la fecha", () => {
        expect(validarOrden({ fecha: "2026-11-24", fechaEntrega: "2026-11-23" })).not.toBe(true);
        expect(validarOrden({ fecha: "2026-11-24", fechaEntrega: "2026-11-24" })).toBe(true);
        expect(validarOrden({ fecha: "2026-11-24", fechaEntrega: "" })).toBe(true);
        expect(validarOrden({ fecha: "", fechaEntrega: "" })).toBe("La fecha es obligatoria");
    });

    it("el lote pide artículo y cantidad", () => {
        expect(validarFormLote({ articuloId: "", cantidad: 1, fechaFabricacion: "" })).not.toBe(true);
        expect(validarFormLote({ articuloId: "A", cantidad: -1, fechaFabricacion: "" })).not.toBe(true);
        expect(validarFormLote({ articuloId: "A", cantidad: 1, fechaFabricacion: "" })).toBe(true);
    });

    it("fecha de fabricación por defecto: hoy + 20 días", () => {
        expect(fechaFabricacionPorDefecto(new Date(2026, 10, 24))).toBe("2026-12-14");
    });
});

describe("orden de producción: cambios", () => {
    it("solo van los campos de la cabecera que cambian (vacío y null son lo mismo)", () => {
        const antes = orden({ descripcion: "A", clienteId: "000001", cliente: "Cliente" });
        const despues = { ...antes, descripcion: "B", clienteId: "000001", cliente: "Otro nombre", pedidoId: null as unknown as string };
        expect(cambiosOrden(antes, despues)).toEqual({ descripcion: "B" });
        expect(cambiosOrden(antes, { ...antes, clienteId: null as unknown as string })).toEqual({ clienteId: "" });
        expect(cambiosOrden(antes, antes)).toEqual({});
    });

    it("cambios del lote: cantidad (con coma) y fecha", () => {
        const l = lote("LS1", 10);
        expect(cambiosLote(l, { articuloId: "CAMISA", cantidad: "12,5", fechaFabricacion: "2026-12-14" })).toEqual({ cantidad: 12.5 });
        expect(cambiosLote(l, { articuloId: "CAMISA", cantidad: 10, fechaFabricacion: "2026-12-20" }))
            .toEqual({ fechaFabricacion: "2026-12-20" });
        expect(cambiosLote(l, { articuloId: "CAMISA", cantidad: 10, fechaFabricacion: "2026-12-14" })).toEqual({});
    });
});

describe("orden de producción: ciclo de vida y un lote por orden", () => {
    it("fuera de PTE solo descripción, observaciones y fecha de entrega", () => {
        const enCurso = acciones({ "produccion.orden.cambiar": false });
        expect(campoOrdenEditable({ estado: "EN CURSO" }, enCurso, "fecha")).toBe(false);
        expect(campoOrdenEditable({ estado: "EN CURSO" }, enCurso, "clienteId")).toBe(false);
        expect(campoOrdenEditable({ estado: "EN CURSO" }, enCurso, "descripcion")).toBe(true);
        expect(campoOrdenEditable({ estado: "EN CURSO" }, enCurso, "fechaEntrega")).toBe(true);
        expect(campoOrdenEditable({ estado: "EN CURSO" }, enCurso, "observaciones")).toBe(true);
        expect(campoOrdenEditable({ estado: "EN CURSO" }, enCurso)).toBe(true);
        expect(campoOrdenEditable({ estado: "PTE" }, acciones({ "produccion.orden.cambiar": true }), "fecha")).toBe(true);
    });

    it("sin acciones leídas decide el estado", () => {
        expect(campoOrdenEditable({ estado: "PTE" }, null, "fecha")).toBe(true);
        expect(campoOrdenEditable({ estado: "TERMINADA" }, null, "fecha")).toBe(false);
    });

    it("«Añadir lote» solo sin lote y si cabe", () => {
        const pte = acciones({ "produccion.orden.anadir_lote": true });
        expect(puedeAnadirLote(orden(), pte)).toBe(true);
        expect(puedeAnadirLote(orden({ lotes: [lote("LS1")] }), pte)).toBe(false);
        expect(puedeAnadirLote(orden(), acciones({ "produccion.orden.anadir_lote": false }))).toBe(false);
        expect(puedeAnadirLote(orden(), acciones({ "produccion.orden.anadir_lote": true }, false))).toBe(false);
        expect(puedeAnadirLote(orden({ estado: "EN CURSO" }), null)).toBe(false);
    });

    it("lote único solo con exactamente uno (las antiguas con varios se listan)", () => {
        expect(loteUnico(orden())).toBeNull();
        expect(loteUnico(orden({ lotes: [lote("LS1")] }))?.id).toBe("LS1");
        expect(loteUnico(orden({ lotes: [lote("LS1"), lote("LS2")] }))).toBeNull();
    });
});

describe("selector de pedido", () => {
    it("por código, del cliente si se indica, o el pedido exacto", () => {
        expect(filtroPedidosCliente("2026")).toEqual([["codigo", "~", "2026"]]);
        expect(filtroPedidosCliente("2026", "000001")).toEqual([["codigo", "~", "2026"], ["cliente_id", "=", "000001"]]);
        expect(filtroPedidosCliente("", undefined, "20260A000001")).toEqual([["codigo", "=", "20260A000001"]]);
    });
});

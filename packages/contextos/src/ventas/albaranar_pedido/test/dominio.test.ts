import { describe, expect, test } from "vitest";
import type { LineaPedido } from "#/ventas/pedido/diseño.ts";
import {
    calcularEnviada,
    cantidadPendienteLinea,
    lineaDesdeLineaPedido,
    marcarTodasPendientes,
    metaAlbaranarPedido,
    metaLinea,
} from "../dominio.ts";
import { modeloEsValido, validacionCampoModelo } from "@olula/lib/dominio.ts";

const lineaPedidoBase = (overrides: Partial<LineaPedido> = {}): LineaPedido =>
    ({
        id: "lin-1",
        referencia: "ART-1",
        descripcion: "Artículo prueba",
        cantidad: 10,
        servida: 3,
        porLotes: false,
        ...overrides,
    }) as LineaPedido;

describe("albaranar_pedido ventas (T3.1 parcial)", () => {
    test("cantidadPendienteLinea = cantidad − servida", () => {
        expect(cantidadPendienteLinea({ cantidad: 10, servida: 3 })).toBe(7);
        expect(cantidadPendienteLinea({ cantidad: 5, servida: 8 })).toBe(0);
    });

    test("lineaDesdeLineaPedido pre-rellena enviada con lo pendiente", () => {
        const linea = lineaDesdeLineaPedido(lineaPedidoBase());
        expect(linea.pendiente).toBe(7);
        expect(linea.enviada).toBe(7);
    });

    test("linea por lotes arranca con enviada 0", () => {
        const linea = lineaDesdeLineaPedido(lineaPedidoBase({ porLotes: true }));
        expect(linea.pendiente).toBe(7);
        expect(linea.enviada).toBe(0);
        expect(calcularEnviada(linea)).toBe(0);
    });

    test("enviada no puede superar lo pendiente", () => {
        const linea = lineaDesdeLineaPedido(lineaPedidoBase());
        const invalida = { ...linea, enviada: 99 };
        expect(validacionCampoModelo(metaLinea)(invalida, "enviada")).toMatch(/pendiente/);
    });

    test("marcarTodasPendientes restaura cantidades pendientes", () => {
        const linea = lineaDesdeLineaPedido(lineaPedidoBase());
        const modelo = {
            id: "ped-1",
            lineas: [{ ...linea, enviada: 2 }],
        };
        const actualizado = marcarTodasPendientes(modelo);
        expect(actualizado.lineas[0].enviada).toBe(7);
    });

    test("modelo válido con al menos una línea a enviar > 0", () => {
        const linea = lineaDesdeLineaPedido(lineaPedidoBase());
        expect(modeloEsValido(metaAlbaranarPedido)({ id: "p1", lineas: [linea] })).toBe(true);
        expect(
            modeloEsValido(metaAlbaranarPedido)({
                id: "p1",
                lineas: [{ ...linea, enviada: 0 }],
            })
        ).toBe(false);
    });
});

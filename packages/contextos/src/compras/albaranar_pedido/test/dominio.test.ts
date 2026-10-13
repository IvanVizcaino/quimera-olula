import { describe, expect, test } from "vitest";
import type { LineaPedido } from "#/compras/pedido/diseño.ts";
import {
    calcularRecibiendo,
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
        cantidadRecibida: 3,
        porLotes: false,
        ...overrides,
    }) as LineaPedido;

describe("albaranar_pedido compras (T3.1 parcial)", () => {
    test("cantidadPendienteLinea = cantidad − recibida", () => {
        expect(cantidadPendienteLinea({ cantidad: 10, recibida: 3 })).toBe(7);
        expect(cantidadPendienteLinea({ cantidad: 5, recibida: 8 })).toBe(0);
    });

    test("lineaDesdeLineaPedido pre-rellena recibiendo con lo pendiente", () => {
        const linea = lineaDesdeLineaPedido(lineaPedidoBase());
        expect(linea.pendiente).toBe(7);
        expect(linea.recibida).toBe(3);
        expect(linea.recibiendo).toBe(7);
    });

    test("linea por lotes arranca con recibiendo 0", () => {
        const linea = lineaDesdeLineaPedido(lineaPedidoBase({ porLotes: true }));
        expect(linea.pendiente).toBe(7);
        expect(linea.recibiendo).toBe(0);
        expect(calcularRecibiendo(linea)).toBe(0);
    });

    test("recibiendo no puede superar lo pendiente", () => {
        const linea = lineaDesdeLineaPedido(lineaPedidoBase());
        const invalida = { ...linea, recibiendo: 99 };
        expect(validacionCampoModelo(metaLinea)(invalida, "recibiendo")).toMatch(/pendiente/);
    });

    test("marcarTodasPendientes restaura cantidades pendientes", () => {
        const linea = lineaDesdeLineaPedido(lineaPedidoBase());
        const modelo = {
            id: "ped-1",
            lineas: [{ ...linea, recibiendo: 2 }],
        };
        const actualizado = marcarTodasPendientes(modelo);
        expect(actualizado.lineas[0].recibiendo).toBe(7);
    });

    test("modelo válido con al menos una línea a recibir > 0", () => {
        const linea = lineaDesdeLineaPedido(lineaPedidoBase());
        expect(modeloEsValido(metaAlbaranarPedido)({ id: "p1", lineas: [linea] })).toBe(true);
        expect(
            modeloEsValido(metaAlbaranarPedido)({
                id: "p1",
                lineas: [{ ...linea, recibiendo: 0 }],
            })
        ).toBe(false);
    });
});

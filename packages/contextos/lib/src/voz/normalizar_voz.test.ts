import { describe, expect, test } from "vitest";
import { normalizarParaVoz } from "./normalizar_voz.ts";

describe("[voz-normalizar-01] normalizarParaVoz", () => {
    test.each([
        ["El total es 1.500,00 €.", "El total es 1500 euros."],
        ["Cuesta 12,50 €", "Cuesta 12 euros con 50"],
        ["Cuesta 12,5 €", "Cuesta 12 euros con 50"],
        ["Son 1 €", "Son 1 euro"],
        ["Debe 3.200 euros", "Debe 3200 euros"],
        ["Importe: 250 EUR", "Importe: 250 euros"],
    ])("importes: «%s»", (texto, esperado) => expect(normalizarParaVoz(texto)).toBe(esperado));

    test.each([
        ["Vence el 2026-10-05.", "Vence el 5 de octubre de 2026."],
        ["Creado 2026-10-05T14:30:00Z", "Creado 5 de octubre de 2026, a las 14 y 30"],
        ["Entrega el 05/10/2026", "Entrega el 5 de octubre de 2026"],
        ["Fecha 2026-13-40", "Fecha 2026-13-40"],
    ])("fechas: «%s»", (texto, esperado) => expect(normalizarParaVoz(texto)).toBe(esperado));

    test.each([
        ["Abre a las 9:00", "Abre a las 9"],
        ["Reunión a las 14:30", "Reunión a las 14 y 30"],
    ])("horas: «%s»", (texto, esperado) => expect(normalizarParaVoz(texto)).toBe(esperado));

    test.each([
        ["El pedido PED-00123 está listo", "El pedido PED 123 está listo"],
        ["Factura FAC/0045", "Factura FAC 45"],
    ])("códigos: «%s»", (texto, esperado) => expect(normalizarParaVoz(texto)).toBe(esperado));

    test.each([
        ["Quedan 15 uds", "Quedan 15 unidades"],
        ["Pesa 2,5 kg.", "Pesa 2,5 kilos"],
        ["Un descuento del 15 %", "Un descuento del 15 por ciento"],
        ["Hay 12.000 artículos", "Hay 12000 artículos"],
    ])("unidades, porcentajes y miles: «%s»", (texto, esperado) => expect(normalizarParaVoz(texto)).toBe(esperado));

    test("no toca texto normal ni decimales sin unidad", () => {
        expect(normalizarParaVoz("Tienes 3 pedidos y una media de 2,5 por día")).toBe(
            "Tienes 3 pedidos y una media de 2,5 por día");
        expect(normalizarParaVoz("Los gatos ganan")).toBe("Los gatos ganan");
    });
});

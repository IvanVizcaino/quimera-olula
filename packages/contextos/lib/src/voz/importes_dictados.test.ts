import { describe, expect, test } from "vitest";
import { normalizarImportesDictados } from "./importes_dictados.ts";
import { parsearNumeroVoz } from "./parsearNumeroVoz.ts";

describe("[voz-importes-01] normalizarImportesDictados", () => {
    test.each([
        ["cambia el precio a 12 con 50", "cambia el precio a 12,50"],
        ["cambia el precio a doce con cincuenta", "cambia el precio a 12,50"],
        ["pon el precio a 12 € con 50", "pon el precio a 12,50 €"],
        ["pon el precio a doce euros con cincuenta", "pon el precio a 12,50 €"],
        ["pon el precio a doce euros cincuenta", "pon el precio a 12,50 €"],
        ["a 12 euros 50 céntimos la unidad", "a 12,50 € la unidad"],
        ["cuesta veinticinco con cinco", "cuesta 25,05"],
        ["el descuento es tres coma cinco", "el descuento es 3,5"],
        ["el descuento es 3 coma 5", "el descuento es 3,5"],
        ["precio 12.50", "precio 12,50"],
        ["precio 12.5 euros", "precio 12,5 euros"],
        ["precio ciento veinte con noventa y nueve.", "precio 120,99."],
        ["mil doscientos con treinta euros", "1200,30 €"],
    ])("«%s» → «%s»", (texto, esperado) => {
        expect(normalizarImportesDictados(texto)).toBe(esperado);
    });

    test.each([
        "cuántos pedidos tengo con Acme",
        "abre el pedido de 1.500 unidades",
        "el pedido 12 con el cliente nuevo",
        "el pedido 12 con 3 líneas",
        "dame 5 con 2 decimales",
        "dame los 5 primeros con importe mayor",
        "precio 12,50",
        "con cincuenta clientes",
        "",
    ])("no toca «%s»", texto => {
        expect(normalizarImportesDictados(texto)).toBe(texto);
    });
});

describe("[voz-importes-02] parsearNumeroVoz entiende importes", () => {
    test.each([
        ["doce con cincuenta", 12.5],
        ["12 con 50", 12.5],
        ["doce euros con cincuenta", 12.5],
        ["doce euros cincuenta", 12.5],
        ["12 euros", 12],
        ["veinte con cinco céntimos", 20.05],
        ["tres coma cinco", 3.5],
    ])("«%s» → %s", (texto, esperado) => {
        expect(parsearNumeroVoz(texto)).toBeCloseTo(esperado, 5);
    });
});

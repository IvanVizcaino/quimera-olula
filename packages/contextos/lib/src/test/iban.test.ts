import { ibanValido, normalizarIban } from "../iban.js";

describe("normalizarIban", () => {
    test("quita espacios y guiones y pasa a mayúsculas", () => {
        expect(normalizarIban(" es91 2100-0418 45 0200051332 ")).toBe(
            "ES9121000418450200051332"
        );
    });
});

describe("ibanValido", () => {
    test.each([
        "ES9121000418450200051332",
        "ES91 2100 0418 45 0200051332",
        "GB82WEST12345698765432",
        "DE89370400440532013000",
        "PT50000201231234567890154",
    ])("acepta %s", (iban) => {
        expect(ibanValido(iban)).toBe(true);
    });

    test.each([
        "",
        "ES91",
        "1234567890123456",
        "ESXX21000418450200051332",
        "ES9021000418450200051332",
        "ES9121000418450200051333",
        "ES91 2100 0418 45 020005133$",
    ])("rechaza %s", (iban) => {
        expect(ibanValido(iban)).toBe(false);
    });
});

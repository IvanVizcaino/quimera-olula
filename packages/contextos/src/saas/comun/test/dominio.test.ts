import { aImporte, idCatalogoValido, importeValido, normalizarImporte, textoANumero } from "../dominio.ts";

describe("idCatalogoValido", () => {
    test("acepta minúsculas, números y guion bajo", () => {
        expect(idCatalogoValido("pack_ia")).toBe(true);
        expect(idCatalogoValido("plan2")).toBe(true);
    });
    test("rechaza mayúsculas, espacios, inicio no alfabético y longitud 1", () => {
        expect(idCatalogoValido("Plan")).toBe(false);
        expect(idCatalogoValido("pack ia")).toBe(false);
        expect(idCatalogoValido("1plan")).toBe(false);
        expect(idCatalogoValido("a")).toBe(false);
    });
});

describe("importes", () => {
    test("la coma decimal se normaliza a punto", () => {
        expect(normalizarImporte(" 49,5 ")).toBe("49.5");
    });
    test("importeValido admite hasta dos decimales", () => {
        expect(importeValido("49")).toBe(true);
        expect(importeValido("49,99")).toBe(true);
        expect(importeValido("49.999")).toBe(false);
        expect(importeValido("")).toBe(false);
        expect(importeValido("-3")).toBe(false);
    });
    test("aImporte deja dos decimales o el texto tal cual si no es válido", () => {
        expect(aImporte("49")).toBe("49.00");
        expect(aImporte("12,5")).toBe("12.50");
        expect(aImporte("abc")).toBe("abc");
    });
});

describe("textoANumero", () => {
    test("vacío o inválido es null", () => {
        expect(textoANumero("")).toBeNull();
        expect(textoANumero("x")).toBeNull();
    });
    test("convierte números", () => {
        expect(textoANumero("12")).toBe(12);
        expect(textoANumero("1,5")).toBe(1.5);
    });
});

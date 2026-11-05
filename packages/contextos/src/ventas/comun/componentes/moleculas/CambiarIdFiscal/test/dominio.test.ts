import { validacionCampoModelo } from "@olula/lib/dominio.js";
import { describe, expect, test } from "vitest";
import { cambioIdFiscalVacio, idFiscalCompletoValido, metaCambioIdFiscal } from "../dominio.ts";

const validar = validacionCampoModelo(metaCambioIdFiscal);

describe("validación de id fiscal según el tipo", () => {
    test("el NIF debe tener 9 caracteres", () => {
        const modelo = { ...cambioIdFiscalVacio, tipo_id_fiscal: "NIF", id_fiscal: "12345678Z" };
        expect(validar(modelo, "id_fiscal")).toBe(true);

        const corto = { ...modelo, id_fiscal: "1234" };
        expect(validar(corto, "id_fiscal")).toBe("El NIF debe tener 9 caracteres");
    });

    test("el V.A.T. debe cumplir ESXXXXXXXXXX", () => {
        const modelo = { ...cambioIdFiscalVacio, tipo_id_fiscal: "NIF/IVA", id_fiscal: "ES12345678Z" };
        expect(validar(modelo, "id_fiscal")).toBe(true);

        const sinPrefijo = { ...modelo, id_fiscal: "12345678901" };
        expect(validar(sinPrefijo, "id_fiscal")).toBe("El VAT debe cumplir ESXXXXXXXXXX");
    });

    test("un NIF válido deja de serlo al cambiar el tipo a V.A.T.", () => {
        const nif = { ...cambioIdFiscalVacio, tipo_id_fiscal: "NIF", id_fiscal: "12345678Z" };
        expect(validar(nif, "id_fiscal")).toBe(true);

        const vat = { ...nif, tipo_id_fiscal: "NIF/IVA" };
        expect(validar(vat, "id_fiscal")).toBe("El VAT debe cumplir ESXXXXXXXXXX");
    });

    test("el tipo debe ser uno de los aceptados por el servidor", () => {
        const modelo = { ...cambioIdFiscalVacio, tipo_id_fiscal: "OTRO", id_fiscal: "12345678Z" };
        expect(validar(modelo, "tipo_id_fiscal")).toBe("El tipo debe ser N.I.F., V.A.T. u OTRO");
    });

    test("Otro y PASAPORTE se aceptan y no validan el formato del id", () => {
        const otro = { ...cambioIdFiscalVacio, tipo_id_fiscal: "Otro", id_fiscal: "X1" };
        expect(validar(otro, "tipo_id_fiscal")).toBe(true);
        expect(validar(otro, "id_fiscal")).toBe(true);

        const pasaporte = { ...cambioIdFiscalVacio, tipo_id_fiscal: "PASAPORTE", id_fiscal: "X1" };
        expect(validar(pasaporte, "tipo_id_fiscal")).toBe(true);
        expect(validar(pasaporte, "id_fiscal")).toBe(true);
    });

    test("el tipo vacío no es válido", () => {
        expect(validar(cambioIdFiscalVacio, "tipo_id_fiscal")).toBe("Campo requerido");
    });

    test("idFiscalCompletoValido exige tipo e id coherentes", () => {
        expect(idFiscalCompletoValido({ tipo_id_fiscal: "NIF", id_fiscal: "12345678Z" })).toBe(true);
        expect(idFiscalCompletoValido({ tipo_id_fiscal: "NIF/IVA", id_fiscal: "12345678Z" })).toBe(false);
        expect(idFiscalCompletoValido({ tipo_id_fiscal: "", id_fiscal: "12345678Z" })).toBe(false);
    });
});

import { describe, expect, test } from "vitest";
import { cambiosPais, metaNuevoPais, nuevoPaisVacio, paisVacio } from "../dominio.ts";
import { cambiosPaisAApi, nuevoPaisAApi, paisDesdeApi } from "../infraestructura.ts";

describe("países (paises)", () => {
    test("paisDesdeApi convierte nulos", () => {
        const pais = paisDesdeApi({
            id: "ES", nombre: "España", codiso: "ES", codigo_iso_alpha2: null, codigo_iso_alpha3: "ESP",
            en_ue: true, zona_id: null, descripcion_zona: null, zona_sepa: null,
            validar_provincias: null, exigir_validacion: null, funcion_validacion: null,
        });
        expect(pais).toMatchObject({ codigoIsoAlpha3: "ESP", enUe: true, zonaSepa: false, zonaId: "" });
    });

    test("a la API: textos vacíos como null y booleanos tal cual", () => {
        expect(cambiosPaisAApi({ zonaId: " ", enUe: false, nombre: " Italia " })).toEqual({
            zona_id: null, en_ue: false, nombre: "Italia",
        });
        expect(nuevoPaisAApi({ ...nuevoPaisVacio(), id: " IT " })).toMatchObject({ id: "IT" });
    });

    test("no deja exigir la validación del CIF sin código ISO (paises.qs)", () => {
        const validar = metaNuevoPais.campos!.exigirValidacion.validacion!;
        expect(validar({ ...nuevoPaisVacio(), exigirValidacion: true })).toMatch(/I.S.O./);
        expect(validar({ ...nuevoPaisVacio(), exigirValidacion: true, codiso: "ES" })).toBe(true);
    });

    test("cambiosPais detecta solo lo editado", () => {
        const previo = { ...paisVacio(), id: "ES" };
        expect(cambiosPais(previo, { ...previo, zonaSepa: true })).toEqual({ zonaSepa: true });
    });
});

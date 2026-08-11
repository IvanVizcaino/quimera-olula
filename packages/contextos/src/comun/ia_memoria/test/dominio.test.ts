import { iaMemoriaVacia, metaIaMemoria } from "#/comun/ia_memoria/dominio.ts";
import { metaNuevaIaMemoria, nuevaIaMemoriaVacia } from "#/comun/ia_memoria/crear/crear.ts";
import { campoModeloEsValido } from "@olula/lib/dominio.js";
import { describe, expect, test } from "vitest";

// ---------------------------------------------------------------------------
// [ia-memoria-dominio-01] iaMemoriaVacia retorna una memoria con los campos por defecto
// ---------------------------------------------------------------------------

describe("[ia-memoria-dominio-01] iaMemoriaVacia retorna una memoria con los campos por defecto correctos", () => {
    test("tiene id vacío", () => {
        expect(iaMemoriaVacia.id).toBe("");
    });

    test("tiene titulo vacío", () => {
        expect(iaMemoriaVacia.titulo).toBe("");
    });

    test("tiene contenido vacío", () => {
        expect(iaMemoriaVacia.contenido).toBe("");
    });

    test("tiene activo en true por defecto", () => {
        expect(iaMemoriaVacia.activo).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// [ia-memoria-dominio-02] metaIaMemoria valida que titulo y contenido no estén vacíos
// ---------------------------------------------------------------------------

describe("[ia-memoria-dominio-02] metaIaMemoria valida que titulo y contenido no estén vacíos", () => {
    const esValido = campoModeloEsValido(metaIaMemoria);

    test("titulo vacío es inválido", () => {
        expect(esValido({ ...iaMemoriaVacia, titulo: "" }, "titulo")).toBe(false);
    });

    test("titulo con contenido es válido", () => {
        expect(esValido({ ...iaMemoriaVacia, titulo: "Título" }, "titulo")).toBe(true);
    });

    test("contenido vacío es inválido", () => {
        expect(esValido({ ...iaMemoriaVacia, contenido: "" }, "contenido")).toBe(false);
    });

    test("contenido con texto es válido", () => {
        expect(esValido({ ...iaMemoriaVacia, contenido: "Texto de contexto" }, "contenido")).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// [ia-memoria-dominio-03] nuevaIaMemoriaVacia y metaNuevaIaMemoria (formulario de alta)
// ---------------------------------------------------------------------------

describe("[ia-memoria-dominio-03] nuevaIaMemoriaVacia y metaNuevaIaMemoria", () => {
    test("nuevaIaMemoriaVacia tiene titulo y contenido vacíos", () => {
        expect(nuevaIaMemoriaVacia).toEqual({ titulo: "", contenido: "" });
    });

    const esValido = campoModeloEsValido(metaNuevaIaMemoria);

    test("titulo vacío es inválido en el alta", () => {
        expect(esValido({ ...nuevaIaMemoriaVacia, titulo: "" }, "titulo")).toBe(false);
    });

    test("contenido vacío es inválido en el alta", () => {
        expect(esValido({ ...nuevaIaMemoriaVacia, contenido: "" }, "contenido")).toBe(false);
    });

    test("titulo y contenido rellenos son válidos en el alta", () => {
        const modelo = { titulo: "Título", contenido: "Contenido" };
        expect(esValido(modelo, "titulo")).toBe(true);
        expect(esValido(modelo, "contenido")).toBe(true);
    });
});

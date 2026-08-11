import { iaFlujoVacio, metaIaFlujo } from "#/comun/ia_flujo/dominio.ts";
import { metaNuevoIaFlujo, nuevoIaFlujoVacio } from "#/comun/ia_flujo/crear/crear.ts";
import { campoModeloEsValido } from "@olula/lib/dominio.js";
import { describe, expect, test } from "vitest";

// ---------------------------------------------------------------------------
// [ia-flujo-dominio-01] iaFlujoVacio retorna un flujo con los campos por defecto
// ---------------------------------------------------------------------------

describe("[ia-flujo-dominio-01] iaFlujoVacio retorna un flujo con los campos por defecto correctos", () => {
    test("tiene id vacío", () => {
        expect(iaFlujoVacio.id).toBe("");
    });

    test("tiene nombre vacío", () => {
        expect(iaFlujoVacio.nombre).toBe("");
    });

    test("tiene descripcionCorta vacía", () => {
        expect(iaFlujoVacio.descripcionCorta).toBe("");
    });

    test("tiene contenido vacío", () => {
        expect(iaFlujoVacio.contenido).toBe("");
    });

    test("tiene activo en true por defecto", () => {
        expect(iaFlujoVacio.activo).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// [ia-flujo-dominio-02] metaIaFlujo valida que nombre, descripcionCorta y contenido no estén vacíos
// ---------------------------------------------------------------------------

describe("[ia-flujo-dominio-02] metaIaFlujo valida que nombre, descripcionCorta y contenido no estén vacíos", () => {
    const esValido = campoModeloEsValido(metaIaFlujo);

    test("nombre vacío es inválido", () => {
        expect(esValido({ ...iaFlujoVacio, nombre: "" }, "nombre")).toBe(false);
    });

    test("nombre relleno es válido", () => {
        expect(esValido({ ...iaFlujoVacio, nombre: "Nombre" }, "nombre")).toBe(true);
    });

    test("descripcionCorta vacía es inválida", () => {
        expect(esValido({ ...iaFlujoVacio, descripcionCorta: "" }, "descripcionCorta")).toBe(false);
    });

    test("descripcionCorta rellena es válida", () => {
        expect(esValido({ ...iaFlujoVacio, descripcionCorta: "Descripción" }, "descripcionCorta")).toBe(true);
    });

    test("contenido vacío es inválido", () => {
        expect(esValido({ ...iaFlujoVacio, contenido: "" }, "contenido")).toBe(false);
    });

    test("contenido relleno es válido", () => {
        expect(esValido({ ...iaFlujoVacio, contenido: "Pasos del flujo" }, "contenido")).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// [ia-flujo-dominio-03] nuevoIaFlujoVacio y metaNuevoIaFlujo (formulario de alta)
// ---------------------------------------------------------------------------

describe("[ia-flujo-dominio-03] nuevoIaFlujoVacio y metaNuevoIaFlujo", () => {
    test("nuevoIaFlujoVacio tiene todos los campos vacíos", () => {
        expect(nuevoIaFlujoVacio).toEqual({
            nombre: "",
            descripcionCorta: "",
            contenido: "",
        });
    });

    const esValido = campoModeloEsValido(metaNuevoIaFlujo);

    test("nombre vacío es inválido en el alta", () => {
        expect(esValido({ ...nuevoIaFlujoVacio, nombre: "" }, "nombre")).toBe(false);
    });

    test("descripcionCorta vacía es inválida en el alta", () => {
        expect(esValido({ ...nuevoIaFlujoVacio, descripcionCorta: "" }, "descripcionCorta")).toBe(false);
    });

    test("contenido vacío es inválido en el alta", () => {
        expect(esValido({ ...nuevoIaFlujoVacio, contenido: "" }, "contenido")).toBe(false);
    });

    test("todos los campos rellenos son válidos en el alta", () => {
        const modelo = {
            nombre: "Nombre",
            descripcionCorta: "Descripción",
            contenido: "Contenido",
        };
        expect(esValido(modelo, "nombre")).toBe(true);
        expect(esValido(modelo, "descripcionCorta")).toBe(true);
        expect(esValido(modelo, "contenido")).toBe(true);
    });
});

import type { IaFlujoApi } from "#/comun/ia_flujo/infraestructura.ts";
import { iaFlujoDesdeApi, nuevoIaFlujoAApi } from "#/comun/ia_flujo/infraestructura.ts";
import { describe, expect, test } from "vitest";

// ---------------------------------------------------------------------------
// [ia-flujo-infra-01] iaFlujoDesdeApi convierte de snake_case API a camelCase dominio
// ---------------------------------------------------------------------------

describe("[ia-flujo-infra-01] iaFlujoDesdeApi convierte correctamente de snake_case API a camelCase dominio", () => {
    const iaFlujoApi: IaFlujoApi = {
        id: "flujo-1",
        nombre: "Alta de cliente",
        descripcion_corta: "Pasos para dar de alta un cliente nuevo",
        contenido: "1. Pedir NIF. 2. Crear ficha. 3. Confirmar por email.",
        activo: true,
        creado_por: "admin@olula.com",
        creado_en: "2026-01-10T10:00:00Z",
        actualizado_en: "2026-02-15T12:30:00Z",
    };

    test("mapea id correctamente", () => {
        expect(iaFlujoDesdeApi(iaFlujoApi).id).toBe("flujo-1");
    });

    test("mapea nombre correctamente", () => {
        expect(iaFlujoDesdeApi(iaFlujoApi).nombre).toBe("Alta de cliente");
    });

    test("mapea descripcion_corta a descripcionCorta", () => {
        expect(iaFlujoDesdeApi(iaFlujoApi).descripcionCorta).toBe(
            "Pasos para dar de alta un cliente nuevo"
        );
    });

    test("mapea contenido correctamente", () => {
        expect(iaFlujoDesdeApi(iaFlujoApi).contenido).toBe(
            "1. Pedir NIF. 2. Crear ficha. 3. Confirmar por email."
        );
    });

    test("mapea activo correctamente", () => {
        expect(iaFlujoDesdeApi(iaFlujoApi).activo).toBe(true);
    });

    test("mapea creado_por a creadoPor", () => {
        expect(iaFlujoDesdeApi(iaFlujoApi).creadoPor).toBe("admin@olula.com");
    });

    test("mapea creado_en a creadoEn (Date)", () => {
        const iaFlujo = iaFlujoDesdeApi(iaFlujoApi);
        expect(iaFlujo.creadoEn).toBeInstanceOf(Date);
        expect(iaFlujo.creadoEn.toISOString()).toBe("2026-01-10T10:00:00.000Z");
    });

    test("mapea actualizado_en a actualizadoEn (Date)", () => {
        const iaFlujo = iaFlujoDesdeApi(iaFlujoApi);
        expect(iaFlujo.actualizadoEn).toBeInstanceOf(Date);
        expect(iaFlujo.actualizadoEn.toISOString()).toBe("2026-02-15T12:30:00.000Z");
    });

    test("mapea activo false correctamente", () => {
        const iaFlujoInactivo: IaFlujoApi = { ...iaFlujoApi, activo: false };
        expect(iaFlujoDesdeApi(iaFlujoInactivo).activo).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// [ia-flujo-infra-02] nuevoIaFlujoAApi convierte de camelCase dominio a snake_case API
// ---------------------------------------------------------------------------

describe("[ia-flujo-infra-02] nuevoIaFlujoAApi convierte correctamente de camelCase dominio a snake_case API", () => {
    test("mapea descripcionCorta a descripcion_corta", () => {
        const payload = nuevoIaFlujoAApi({
            nombre: "Cierre de caja",
            descripcionCorta: "Pasos para el cierre diario de caja",
            contenido: "1. Contar efectivo. 2. Cuadrar con TPV. 3. Firmar arqueo.",
        });

        expect(payload).toEqual({
            nombre: "Cierre de caja",
            descripcion_corta: "Pasos para el cierre diario de caja",
            contenido: "1. Contar efectivo. 2. Cuadrar con TPV. 3. Firmar arqueo.",
        });
    });
});

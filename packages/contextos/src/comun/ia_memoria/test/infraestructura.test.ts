import type { IaMemoriaApi } from "#/comun/ia_memoria/infraestructura.ts";
import { iaMemoriaDesdeApi, nuevaIaMemoriaAApi } from "#/comun/ia_memoria/infraestructura.ts";
import { describe, expect, test } from "vitest";

// ---------------------------------------------------------------------------
// [ia-memoria-infra-01] iaMemoriaDesdeApi convierte de snake_case API a camelCase dominio
// ---------------------------------------------------------------------------

describe("[ia-memoria-infra-01] iaMemoriaDesdeApi convierte correctamente de snake_case API a camelCase dominio", () => {
    const iaMemoriaApi: IaMemoriaApi = {
        id: "mem-1",
        titulo: "Horario de atención",
        contenido: "El horario de atención es de 9 a 18h de lunes a viernes.",
        activo: true,
        creado_por: "admin@olula.com",
        creado_en: "2026-01-10T10:00:00Z",
        actualizado_en: "2026-02-15T12:30:00Z",
    };

    test("mapea id correctamente", () => {
        expect(iaMemoriaDesdeApi(iaMemoriaApi).id).toBe("mem-1");
    });

    test("mapea titulo correctamente", () => {
        expect(iaMemoriaDesdeApi(iaMemoriaApi).titulo).toBe("Horario de atención");
    });

    test("mapea contenido correctamente", () => {
        expect(iaMemoriaDesdeApi(iaMemoriaApi).contenido).toBe(
            "El horario de atención es de 9 a 18h de lunes a viernes."
        );
    });

    test("mapea activo correctamente", () => {
        expect(iaMemoriaDesdeApi(iaMemoriaApi).activo).toBe(true);
    });

    test("mapea creado_por a creadoPor", () => {
        expect(iaMemoriaDesdeApi(iaMemoriaApi).creadoPor).toBe("admin@olula.com");
    });

    test("mapea creado_en a creadoEn (Date)", () => {
        const iaMemoria = iaMemoriaDesdeApi(iaMemoriaApi);
        expect(iaMemoria.creadoEn).toBeInstanceOf(Date);
        expect(iaMemoria.creadoEn.toISOString()).toBe("2026-01-10T10:00:00.000Z");
    });

    test("mapea actualizado_en a actualizadoEn (Date)", () => {
        const iaMemoria = iaMemoriaDesdeApi(iaMemoriaApi);
        expect(iaMemoria.actualizadoEn).toBeInstanceOf(Date);
        expect(iaMemoria.actualizadoEn.toISOString()).toBe("2026-02-15T12:30:00.000Z");
    });

    test("mapea activo false correctamente", () => {
        const iaMemoriaInactiva: IaMemoriaApi = { ...iaMemoriaApi, activo: false };
        expect(iaMemoriaDesdeApi(iaMemoriaInactiva).activo).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// [ia-memoria-infra-02] nuevaIaMemoriaAApi convierte de camelCase dominio a snake_case API
// ---------------------------------------------------------------------------

describe("[ia-memoria-infra-02] nuevaIaMemoriaAApi convierte correctamente de camelCase dominio a snake_case API", () => {
    test("mapea titulo y contenido sin transformar el nombre", () => {
        const payload = nuevaIaMemoriaAApi({
            titulo: "Política de devoluciones",
            contenido: "Las devoluciones se aceptan hasta 30 días después de la compra.",
        });

        expect(payload).toEqual({
            titulo: "Política de devoluciones",
            contenido: "Las devoluciones se aceptan hasta 30 días después de la compra.",
        });
    });
});

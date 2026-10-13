/**
 * T7.2 — Cambiar total de venta TPV (dto especial Crema)
 *
 * Tests de dominio puro: metaCambiarTotalVenta (validaciones) y
 * pluginActivo para la guardia "dto_cabecera_venta"/"eneboo".
 */
import { describe, expect, test, beforeEach, vi } from "vitest";
import { metaCambiarTotalVenta, cambiarTotalVentaVacio } from "#/tpv/venta/cambiar_total/dominio.ts";
import { pluginActivo } from "@olula/lib/plugins.tsx";
import { plugin } from "@olula/lib/dominio.ts";

// ── helpers de MetaModelo ──────────────────────────────────────────────────
const campoCampos = metaCambiarTotalVenta.campos!;

const valido = (total: number) => {
    const campo = campoCampos.total;
    if (campo.requerido && (total === undefined || total === null)) return false;
    if (campo.positivo && total < 0) return false;
    return true;
};

describe("metaCambiarTotalVenta", () => {
    test("el valor vacío inicial es 0", () => {
        expect(cambiarTotalVentaVacio.total).toBe(0);
    });

    test("campo total es decimal requerido positivo", () => {
        const campo = campoCampos.total;
        expect(campo.tipo).toBe("decimal");
        expect(campo.requerido).toBe(true);
        expect(campo.positivo).toBe(true);
    });

    test("total positivo es válido", () => {
        expect(valido(12.5)).toBe(true);
    });

    test("total negativo es inválido", () => {
        expect(valido(-1)).toBe(false);
    });

    test("total cero no incumple positivo (es >= 0)", () => {
        // 0 no es < 0, se acepta (el campo positivo bloquea < 0, no = 0)
        expect(valido(0)).toBe(true);
    });
});

// ── guardia de plugin ──────────────────────────────────────────────────────
vi.mock("@olula/lib/dominio.ts", async (importOriginal) => {
    const real = await importOriginal<typeof import("@olula/lib/dominio.ts")>();
    return { ...real, plugin: vi.fn() };
});

const mockPlugin = plugin as ReturnType<typeof vi.fn>;

describe("pluginActivo('dto_cabecera_venta', 'eneboo')", () => {
    beforeEach(() => mockPlugin.mockReset());

    test("activo con variante 'eneboo' → true", () => {
        mockPlugin.mockReturnValue("eneboo");
        expect(pluginActivo("dto_cabecera_venta", "eneboo")).toBe(true);
    });

    test("activo con variante 'activo' (sin eneboo) → false", () => {
        mockPlugin.mockReturnValue("activo");
        expect(pluginActivo("dto_cabecera_venta", "eneboo")).toBe(false);
    });

    test("plugin ausente → false", () => {
        mockPlugin.mockReturnValue(undefined);
        expect(pluginActivo("dto_cabecera_venta", "eneboo")).toBe(false);
    });

    test("plugin inactivo → false", () => {
        mockPlugin.mockReturnValue("inactivo");
        expect(pluginActivo("dto_cabecera_venta", "eneboo")).toBe(false);
    });
});

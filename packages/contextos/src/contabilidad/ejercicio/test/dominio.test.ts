import { describe, expect, test } from "vitest";
import {
    ejercicioAperturaSugerido,
    fechaCierrePorDefecto,
    formCierreEjercicioVacio,
    payloadCerrarDesdeForm,
    payloadCerrarEjercicioAApi,
    validarFormCierre,
} from "../dominio.ts";

describe("cierre ejercicio dominio (CF-02)", () => {
    test("fechaCierrePorDefecto fin de año", () => {
        expect(fechaCierrePorDefecto("2025")).toBe("2025-12-31");
        expect(fechaCierrePorDefecto("20")).toBe("");
    });

    test("ejercicioAperturaSugerido incrementa año", () => {
        expect(ejercicioAperturaSugerido("2025")).toBe("2026");
    });

    test("validarFormCierre exige ejercicio destino si apertura", () => {
        const form = {
            ...formCierreEjercicioVacio(),
            ejercicioId: "2025",
            fecha: "2025-12-31",
            asientoApertura: true,
            ejercicioAperturaId: "",
        };
        expect(validarFormCierre(form)).toMatch(/ejercicio destino/);
        form.ejercicioAperturaId = "2025";
        expect(validarFormCierre(form)).toMatch(/distinto/);
        form.ejercicioAperturaId = "2026";
        expect(validarFormCierre(form)).toBeNull();
    });

    test("payloadCerrarEjercicioAApi snake_case", () => {
        const api = payloadCerrarEjercicioAApi(
            payloadCerrarDesdeForm({
                ...formCierreEjercicioVacio(),
                ejercicioId: "2025",
                fecha: "2025-12-31",
                asientoPyg: true,
                asientoCierre: true,
                asientoApertura: true,
                ejercicioAperturaId: "2026",
            })
        );
        expect(api).toEqual({
            fecha: "2025-12-31",
            asiento_pyg: true,
            asiento_cierre: true,
            asiento_apertura: true,
            ejercicio_apertura_id: "2026",
        });
    });
});

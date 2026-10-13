import { describe, expect, test } from "vitest";
import { criteriaInformeMayor, criteriaInformePeriodo, nombreFicheroPdfInforme } from "../dominio.ts";

describe("criteria informes contables (T6.1)", () => {
    test("criteriaInformePeriodo incluye ejercicio y fechas opcionales", () => {
        const c = criteriaInformePeriodo({
            ejercicioId: "2026",
            fechaDesde: "2026-01-01",
            fechaHasta: "2026-03-31",
        });

        expect(c.filtro).toEqual([
            ["ejercicio_id", "eq", "2026"],
            ["fecha", ">=", "2026-01-01"],
            ["fecha", "<=", "2026-03-31"],
        ]);
    });

    test("criteriaInformePeriodo añade formato y nivel_desglose PGC2008", () => {
        const c = criteriaInformePeriodo({
            ejercicioId: "2026",
            formato: "Abreviado",
            nivelDesglose: "Cuenta",
            omitirSinSaldo: true,
        });
        expect(c.filtro).toContainEqual(["formato", "eq", "Abreviado"]);
        expect(c.filtro).toContainEqual(["nivel_desglose", "eq", "Cuenta"]);
        expect(c.filtro).toContainEqual(["omitir_sin_saldo", "eq", "true"]);
    });

    test("criteriaInformeMayor añade subcuenta_id", () => {
        const c = criteriaInformeMayor({
            ejercicioId: "2026",
            subcuentaId: "12345",
        });

        expect(c.filtro).toContainEqual(["subcuenta_id", "eq", "12345"]);
        expect(c.filtro).toContainEqual(["ejercicio_id", "eq", "2026"]);
    });

    test("nombreFicheroPdfInforme alinea nombres inline del backend", () => {
        expect(nombreFicheroPdfInforme("pyg")).toBe("pyg.pdf");
        expect(nombreFicheroPdfInforme("diario")).toBe("diario.pdf");
        expect(nombreFicheroPdfInforme("sumas_saldos")).toBe("sumas-saldos.pdf");
        expect(nombreFicheroPdfInforme("libro_facturas_emitidas")).toBe("libro-facturas-emitidas.pdf");
        expect(nombreFicheroPdfInforme("libro_facturas_recibidas")).toBe("libro-facturas-recibidas.pdf");
    });
});

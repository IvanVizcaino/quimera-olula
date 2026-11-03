import { describe, expect, test } from "vitest";
import { LibroMayor } from "../diseño.ts";
import {
    etiquetaLibroMayor,
    libroMayorVacio,
    nombreFicheroLibroMayor,
    nuevoLibroMayorInicial,
} from "../dominio.ts";

const ficha = (campos: Partial<LibroMayor> = {}): LibroMayor => ({
    ...libroMayorVacio(),
    id: "3",
    descripcion: "Mayor 2026",
    ejercicioId: "2026",
    ...campos,
});

describe("etiqueta del informe", () => {
    test("usa la descripción y el ejercicio", () => {
        expect(etiquetaLibroMayor(ficha())).toBe("Mayor 2026 — 2026");
    });

    test("sin descripción cae en el ejercicio", () => {
        expect(etiquetaLibroMayor(ficha({ descripcion: "" }))).toBe(
            "Libro mayor 2026"
        );
    });
});

describe("ficha inicial", () => {
    test("arranca con el periodo completo del ejercicio", () => {
        const nuevo = nuevoLibroMayorInicial("2026");

        expect(nuevo.fechaDesde).toBe("2026-01-01");
        expect(nuevo.fechaHasta).toBe("2026-12-31");
    });

    test("arranca con los valores por defecto de Eneboo", () => {
        const nuevo = nuevoLibroMayorInicial("2026");

        expect(nuevo.todasSubcuentas).toBe(true);
        expect(nuevo.saldoInicial).toBe(true);
        expect(nuevo.excluirPartidasCero).toBe(false);
        expect(nuevo.orden).toBe("Fecha");
    });
});

describe("nombre del fichero", () => {
    test("se deriva de la descripción", () => {
        expect(nombreFicheroLibroMayor(ficha())).toBe("mayor-2026.pdf");
    });

    test("sin descripción usa el ejercicio", () => {
        expect(nombreFicheroLibroMayor(ficha({ descripcion: "" }))).toBe(
            "libro-mayor-2026.pdf"
        );
    });
});

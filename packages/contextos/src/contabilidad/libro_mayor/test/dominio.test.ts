import { describe, expect, test } from "vitest";
import { LibroMayor } from "../diseño.ts";
import {
    etiquetaLibroMayor,
    libroMayorVacio,
    metaFormularioLibroMayor,
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

describe("formulario del libro mayor", () => {
    const meta = metaFormularioLibroMayor<LibroMayor>();

    test("las opciones booleanas de co_i_mayor son casillas", () => {
        for (const campo of [
            "todasSubcuentas",
            "saldoInicial",
            "excluirPartidasCero",
        ]) {
            expect(meta.campos?.[campo]?.tipo).toBe("checkbox");
        }
    });

    test("las casillas quedan como booleanos al cambiar", () => {
        const informe = {
            ...libroMayorVacio(),
            saldoInicial: "false" as unknown as boolean,
            excluirPartidasCero: "true" as unknown as boolean,
        };
        const resultado = meta.onChange?.(informe, "saldoInicial", true);
        expect(resultado?.saldoInicial).toBe(false);
        expect(resultado?.excluirPartidasCero).toBe(true);
    });

    test("sin «todas las subcuentas» desde y hasta son obligatorias", () => {
        const requerido = meta.campos?.subcuentaHasta?.requerido as (
            m: LibroMayor
        ) => boolean;
        expect(requerido({ ...libroMayorVacio(), todasSubcuentas: false })).toBe(true);
        expect(requerido(libroMayorVacio())).toBe(false);
    });
});

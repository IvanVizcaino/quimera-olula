import { describe, expect, test } from "vitest";
import { LibroFacturasEmitidas } from "../diseño.ts";
import {
    admiteNumeroDesde,
    admitePorcentaje,
    etiquetaLibroFacturasEmitidas,
    libroFacturasEmitidasVacio,
    nombreFicheroLibroFacturasEmitidas,
    nuevoLibroFacturasEmitidasInicial,
} from "../dominio.ts";

const ficha = (
    campos: Partial<LibroFacturasEmitidas> = {}
): LibroFacturasEmitidas => ({
    ...libroFacturasEmitidasVacio(),
    id: "3",
    descripcion: "Facturas emitidas 1T",
    ejercicioId: "2026",
    ...campos,
});

describe("etiqueta del informe", () => {
    test("usa la descripción y el ejercicio", () => {
        expect(etiquetaLibroFacturasEmitidas(ficha())).toBe(
            "Facturas emitidas 1T — 2026"
        );
    });

    test("sin descripción cae en el ejercicio", () => {
        expect(etiquetaLibroFacturasEmitidas(ficha({ descripcion: "" }))).toBe(
            "Facturas emitidas 2026"
        );
    });
});

describe("dependencias entre opciones", () => {
    test("el porcentaje solo se edita sin «todos los tipos»", () => {
        expect(admitePorcentaje({ todos: true })).toBe(false);
        expect(admitePorcentaje({ todos: false })).toBe(true);
    });

    test("el número inicial solo cuenta con numeración automática", () => {
        expect(admiteNumeroDesde({ numeracionAutomatica: false })).toBe(false);
        expect(admiteNumeroDesde({ numeracionAutomatica: true })).toBe(true);
    });
});

describe("ficha inicial", () => {
    test("arranca con el periodo completo del ejercicio", () => {
        const nuevo = nuevoLibroFacturasEmitidasInicial("2026");

        expect(nuevo.fechaDesde).toBe("2026-01-01");
        expect(nuevo.fechaHasta).toBe("2026-12-31");
    });

    test("arranca con los valores por defecto de Eneboo", () => {
        const nuevo = nuevoLibroFacturasEmitidasInicial("2026");

        expect(nuevo.todos).toBe(true);
        expect(nuevo.conIva).toBe(false);
        expect(nuevo.mostrarNif).toBe(true);
        expect(nuevo.numeracionAutomatica).toBe(false);
        expect(nuevo.numeroDesde).toBe("1");
    });
});

describe("nombre del fichero", () => {
    test("se deriva de la descripción", () => {
        expect(nombreFicheroLibroFacturasEmitidas(ficha())).toBe(
            "facturas-emitidas-1t.pdf"
        );
    });

    test("sin descripción usa el ejercicio", () => {
        expect(
            nombreFicheroLibroFacturasEmitidas(ficha({ descripcion: "" }))
        ).toBe("facturas-emitidas-2026.pdf");
    });
});

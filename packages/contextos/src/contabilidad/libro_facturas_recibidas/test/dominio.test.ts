import { describe, expect, test } from "vitest";
import { LibroFacturasRecibidas } from "../diseño.ts";
import { metaLibroFacturasRecibidas } from "../detalle/detalle.ts";
import { metaNuevoLibroFacturasRecibidas } from "../crear/crear.ts";
import {
    admiteNumeroDesde,
    admitePorcentaje,
    etiquetaLibroFacturasRecibidas,
    libroFacturasRecibidasVacio,
    nombreFicheroLibroFacturasRecibidas,
    nuevoLibroFacturasRecibidasInicial,
} from "../dominio.ts";

const ficha = (
    campos: Partial<LibroFacturasRecibidas> = {}
): LibroFacturasRecibidas => ({
    ...libroFacturasRecibidasVacio(),
    id: "3",
    descripcion: "Facturas recibidas 1T",
    ejercicioId: "2026",
    ...campos,
});

describe("etiqueta del informe", () => {
    test("usa la descripción y el ejercicio", () => {
        expect(etiquetaLibroFacturasRecibidas(ficha())).toBe(
            "Facturas recibidas 1T — 2026"
        );
    });

    test("sin descripción cae en el ejercicio", () => {
        expect(etiquetaLibroFacturasRecibidas(ficha({ descripcion: "" }))).toBe(
            "Facturas recibidas 2026"
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
        const nuevo = nuevoLibroFacturasRecibidasInicial("2026");

        expect(nuevo.fechaDesde).toBe("2026-01-01");
        expect(nuevo.fechaHasta).toBe("2026-12-31");
    });

    test("arranca con los valores por defecto de Eneboo", () => {
        const nuevo = nuevoLibroFacturasRecibidasInicial("2026");

        expect(nuevo.todos).toBe(true);
        expect(nuevo.conIva).toBe(false);
        expect(nuevo.mostrarNif).toBe(true);
        expect(nuevo.numeracionAutomatica).toBe(false);
        expect(nuevo.numeroDesde).toBe("1");
    });
});

describe("nombre del fichero", () => {
    test("se deriva de la descripción", () => {
        expect(nombreFicheroLibroFacturasRecibidas(ficha())).toBe(
            "facturas-recibidas-1t.pdf"
        );
    });

    test("sin descripción usa el ejercicio", () => {
        expect(
            nombreFicheroLibroFacturasRecibidas(ficha({ descripcion: "" }))
        ).toBe("facturas-recibidas-2026.pdf");
    });
});

describe("casillas del formulario", () => {
    const CHECKS = [
        "todos",
        "conIva",
        "mostrarTotalFactura",
        "mostrarNif",
        "mostrarDocumento",
        "mostrarAsiento",
        "numeracionAutomatica",
    ];

    test("alta y ficha pintan como casilla los bool de co_i_facturasrec", () => {
        for (const meta of [
            metaNuevoLibroFacturasRecibidas,
            metaLibroFacturasRecibidas,
        ]) {
            for (const campo of CHECKS) {
                expect(meta.campos?.[campo]?.tipo).toBe("checkbox");
            }
        }
    });

    test("al cambiar, las casillas quedan como booleanos", () => {
        const resultado = metaLibroFacturasRecibidas.onChange?.(
            ficha({ mostrarAsiento: "false" as unknown as boolean }),
            "mostrarAsiento",
            true
        );
        expect(resultado?.mostrarAsiento).toBe(false);
    });
});

describe("% de I.V.A.", () => {
    test("es un número decimal libre en alta y ficha", () => {
        for (const meta of [
            metaNuevoLibroFacturasRecibidas,
            metaLibroFacturasRecibidas,
        ]) {
            expect(meta.campos?.porcentaje?.tipo).toBe("decimal");
            expect(meta.campos?.porcentaje?.decimales).toBe(2);
        }
    });

    test("al marcar todos los tipos pasa a 0 (co_i_facturasrec.qs)", () => {
        const resultado = metaLibroFacturasRecibidas.onChange?.(
            ficha({
                todos: "true" as unknown as boolean,
                porcentaje: 4,
            }),
            "todos",
            false
        );
        expect(resultado?.porcentaje).toBe(0);
    });

    test("sin todos los tipos es obligatorio", () => {
        const requerido = metaLibroFacturasRecibidas.campos?.porcentaje
            ?.requerido as (m: LibroFacturasRecibidas) => boolean;
        expect(requerido(ficha({ todos: false }))).toBe(true);
        expect(requerido(ficha({ todos: true }))).toBe(false);
    });
});

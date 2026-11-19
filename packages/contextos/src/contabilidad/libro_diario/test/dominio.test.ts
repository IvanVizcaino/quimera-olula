import { describe, expect, test } from "vitest";
import { FilaLibroDiario, LibroDiario } from "../diseño.ts";
import {
    CABECERAS_IVA_LIBRO_DIARIO,
    CABECERAS_LIBRO_DIARIO,
    celdasFilaLibroDiario,
    admiteOpcionesDeDetalle,
    etiquetaLibroDiario,
    libroDiarioVacio,
    metaFormularioLibroDiario,
    nombreFicheroLibroDiario,
    nuevoLibroDiarioInicial,
    opcionesCoherentes,
} from "../dominio.ts";

const ficha = (campos: Partial<LibroDiario> = {}): LibroDiario => ({
    ...libroDiarioVacio(),
    id: "3",
    descripcion: "Diario 2026 completo",
    ejercicioId: "2026",
    ...campos,
});

describe("etiqueta del informe", () => {
    test("usa la descripción y el ejercicio", () => {
        expect(etiquetaLibroDiario(ficha())).toBe(
            "Diario 2026 completo — 2026"
        );
    });

    test("sin descripción cae en el ejercicio", () => {
        expect(etiquetaLibroDiario(ficha({ descripcion: "" }))).toBe(
            "Libro diario 2026"
        );
    });
});

describe("opciones de detalle", () => {
    test("el resumen mensual excluye I.V.A. y agrupar por meses", () => {
        expect(admiteOpcionesDeDetalle({ resumenMensual: true })).toBe(false);
    });

    test("sin resumen mensual ambas opciones están disponibles", () => {
        expect(admiteOpcionesDeDetalle({ resumenMensual: false })).toBe(true);
    });
});

describe("ficha inicial", () => {
    test("arranca con el periodo completo del ejercicio", () => {
        const nuevo = nuevoLibroDiarioInicial("2026");

        expect(nuevo.fechaDesde).toBe("2026-01-01");
        expect(nuevo.fechaHasta).toBe("2026-12-31");
    });

    test("arranca con todos los asientos y todas las subcuentas", () => {
        const nuevo = nuevoLibroDiarioInicial("2026");

        expect(nuevo.todosAsientos).toBe(true);
        expect(nuevo.todasSubcuentas).toBe(true);
        expect(nuevo.orden1).toBe("Asiento");
    });
});

describe("nombre del fichero", () => {
    test("se deriva de la descripción", () => {
        expect(nombreFicheroLibroDiario(ficha())).toBe(
            "diario-2026-completo.pdf"
        );
    });

    test("sin descripción usa el ejercicio", () => {
        expect(nombreFicheroLibroDiario(ficha({ descripcion: "" }))).toBe(
            "libro-diario-2026.pdf"
        );
    });

    test("los acentos no llegan al nombre del fichero", () => {
        expect(
            nombreFicheroLibroDiario(ficha({ descripcion: "Año económico" }))
        ).toBe("ano-economico.pdf");
    });
});

describe("formulario del libro diario", () => {
    test("las opciones booleanas de co_i_diario son casillas", () => {
        const meta = metaFormularioLibroDiario<LibroDiario>();
        for (const campo of [
            "todosAsientos",
            "todasSubcuentas",
            "resumenMensual",
            "datosIva",
            "agruparMeses",
        ]) {
            expect(meta.campos?.[campo]?.tipo).toBe("checkbox");
        }
    });

    test("al marcar resumen mensual apaga datos de I.V.A. y agrupar por meses", () => {
        const meta = metaFormularioLibroDiario<LibroDiario>();
        const resultado = meta.onChange?.(
            ficha({
                resumenMensual: "true" as unknown as boolean,
                datosIva: true,
                agruparMeses: true,
            }),
            "resumenMensual",
            false
        );
        expect(resultado?.resumenMensual).toBe(true);
        expect(resultado?.datosIva).toBe(false);
        expect(resultado?.agruparMeses).toBe(false);
    });

    test("opcionesCoherentes no toca nada sin resumen mensual", () => {
        const informe = ficha({ datosIva: true, agruparMeses: true });
        expect(opcionesCoherentes(informe)).toBe(informe);
    });

    test("sin «todas las subcuentas» desde y hasta son obligatorias", () => {
        const meta = metaFormularioLibroDiario<LibroDiario>();
        const requerido = meta.campos?.subcuentaDesde?.requerido as (
            m: LibroDiario
        ) => boolean;
        expect(requerido(ficha({ todasSubcuentas: false }))).toBe(true);
        expect(requerido(ficha({ todasSubcuentas: true }))).toBe(false);
    });
});

const fila = (campos: Partial<FilaLibroDiario>): FilaLibroDiario => ({
    tipo: "partida",
    nivel: 1,
    titulo: "",
    fecha: null,
    asientoNumero: null,
    documento: "",
    codigoSubcuenta: "",
    descripcionSubcuenta: "",
    debe: null,
    haber: null,
    descuadre: null,
    codigoSerie: null,
    factura: null,
    baseImponible: null,
    iva: null,
    recargo: null,
    ...campos,
});

const columnas = (celdas: { columnas: number }[]): number =>
    celdas.reduce((suma, c) => suma + c.columnas, 0);

describe("celdas del resultado agrupado (B11-3/4)", () => {
    const ancho = CABECERAS_LIBRO_DIARIO.length;
    const anchoIva = ancho + CABECERAS_IVA_LIBRO_DIARIO.length;

    test("el mes ocupa toda la fila", () => {
        const celdas = celdasFilaLibroDiario(
            fila({ tipo: "mes", nivel: 0, titulo: "ENERO 2026" }),
            true
        );

        expect(celdas).toHaveLength(1);
        expect(celdas[0].texto).toBe("ENERO 2026");
        expect(celdas[0].columnas).toBe(anchoIva);
    });

    test("el asiento lleva fecha, número y concepto", () => {
        const celdas = celdasFilaLibroDiario(
            fila({
                tipo: "asiento",
                nivel: 0,
                titulo: "Venta",
                fecha: new Date("2026-01-15T12:00:00"),
                asientoNumero: 10,
            }),
            false
        );

        expect(celdas.map((c) => c.texto).slice(0, 3)).toEqual([
            "15/01/2026",
            "10",
            "Venta",
        ]);
        expect(columnas(celdas)).toBe(ancho);
    });

    test("la partida va debajo con sus datos y sin repetir fecha y número", () => {
        const celdas = celdasFilaLibroDiario(
            fila({
                titulo: "Cobro",
                documento: "F-1",
                codigoSubcuenta: "4300000001",
                descripcionSubcuenta: "Cliente",
                debe: 12100,
                haber: 0,
            }),
            false
        );

        expect(celdas.map((c) => c.texto)).toEqual([
            "",
            "",
            "F-1",
            "4300000001",
            "Cliente",
            "Cobro",
            "12.100,00",
            "0,00",
        ]);
    });

    test("con datos de I.V.A., solo la partida que los tiene los muestra", () => {
        const conIva = celdasFilaLibroDiario(
            fila({
                debe: 121,
                haber: 0,
                codigoSerie: "A",
                factura: 7,
                baseImponible: 100,
                iva: 21,
                recargo: 0,
            }),
            true
        );
        const sinIva = celdasFilaLibroDiario(fila({ debe: 100, haber: 0 }), true);

        expect(conIva.slice(ancho).map((c) => c.texto)).toEqual([
            "A",
            "7",
            "100,00",
            "21,00",
            "0,00",
        ]);
        expect(sinIva.slice(ancho).every((c) => c.texto === "")).toBe(true);
        expect(columnas(conIva)).toBe(anchoIva);
    });

    test("el total del mes lleva su descuadre, debe y haber", () => {
        const celdas = celdasFilaLibroDiario(
            fila({
                tipo: "total_mes",
                nivel: 0,
                titulo: "Total ENERO 2026",
                debe: 171,
                haber: 171,
                descuadre: 0,
            }),
            false
        );

        expect(celdas[0].texto).toBe("Total ENERO 2026 · Descuadre 0,00");
        expect(columnas(celdas)).toBe(ancho);
        expect(celdas[1].texto).toBe("171,00");
    });
});

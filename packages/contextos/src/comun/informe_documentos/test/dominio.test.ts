import { describe, expect, test } from "vitest";
import { FichaInforme, PestañaInforme } from "../diseño.ts";
import {
    cambiosFicha,
    conIntervalo,
    fechasIntervalo,
    fichaAApi,
    fichaDesdeApi,
    fichaNueva,
    metaFichaInforme,
    MODOS_POR_DEFECTO,
    nombreFicheroInforme,
    textoCelda,
} from "../dominio.ts";
import { resultadoDesdeApi } from "../infraestructura.ts";

const pestaña: PestañaInforme = {
    clave: "prueba",
    titulo: "Prueba",
    url: "/x/informe/prueba",
    regla: "x",
    filas: [
        [
            { id: "cliente_id", label: "Cliente", tipo: "texto" },
            { id: "fecha_desde", label: "Desde", tipo: "fecha" },
            { id: "fecha_hasta", label: "Hasta", tipo: "fecha" },
            { id: "intervalo", label: "Intervalo", tipo: "opciones", opciones: [] },
        ],
        [
            { id: "acumulado", label: "Acumulado", tipo: "casilla" },
            { id: "importe", label: "Importe", tipo: "decimal" },
            { id: "limite", label: "Límite", tipo: "entero" },
        ],
    ],
    inicial: { intervalo: "" },
    ajustar: (ficha, campo) => (campo === "acumulado" && !ficha.acumulado ? { ...ficha, limite: "" } : ficha),
};

describe("ficha de informe", () => {
    test("la ficha nueva lleva los valores iniciales y casillas desmarcadas", () => {
        expect(fichaNueva(pestaña)).toEqual({
            id: "",
            descripcion: "",
            cliente_id: "",
            fecha_desde: "",
            fecha_hasta: "",
            intervalo: "",
            acumulado: false,
            importe: "",
            limite: "",
        });
    });

    test("de la API: nulos a texto vacío y números a texto", () => {
        const ficha = fichaDesdeApi(pestaña)({
            id: 3,
            descripcion: "D",
            cliente_id: null,
            importe: 12.5,
            acumulado: true,
            limite: 10,
        });
        expect(ficha.id).toBe("3");
        expect(ficha.cliente_id).toBe("");
        expect(ficha.importe).toBe("12.5");
        expect(ficha.acumulado).toBe(true);
    });

    test("a la API: vacíos a null, importes a número", () => {
        const ficha = { ...fichaNueva(pestaña), descripcion: "D", importe: "1,5", limite: "7" };
        expect(fichaAApi(pestaña, ficha)).toEqual({
            descripcion: "D",
            cliente_id: null,
            fecha_desde: null,
            fecha_hasta: null,
            intervalo: null,
            acumulado: false,
            importe: 1.5,
            limite: 7,
        });
    });

    test("cambios: solo lo que ha cambiado", () => {
        const previa: FichaInforme = { ...fichaNueva(pestaña), id: "1", descripcion: "D" };
        const actual = { ...previa, cliente_id: "000001", acumulado: true };
        expect(cambiosFicha(pestaña, previa, actual)).toEqual({ cliente_id: "000001", acumulado: true });
    });

    test("el meta convierte las casillas a booleano y aplica las reglas de la pestaña", () => {
        const meta = metaFichaInforme<FichaInforme>(pestaña);
        const ficha = { ...fichaNueva(pestaña), acumulado: "false", limite: "5" } as unknown as FichaInforme;
        const resultado = meta.onChange!(ficha, "acumulado", true);
        expect(resultado.acumulado).toBe(false);
        expect(resultado.limite).toBe("");
        expect(meta.campos?.acumulado?.tipo).toBe("checkbox");
        expect(meta.campos?.importe?.tipo).toBe("decimal");
        expect(meta.campos?.descripcion?.requerido).toBe(true);
    });
});

describe("intervalos", () => {
    const hoy = new Date(2026, 10, 11); // miércoles 11/11/2026

    test("fechas de cada intervalo", () => {
        expect(fechasIntervalo("000001", hoy)).toEqual(["2026-11-11", "2026-11-11"]);
        expect(fechasIntervalo("000003", hoy)).toEqual(["2026-11-09", "2026-11-15"]);
        expect(fechasIntervalo("000004", hoy)).toEqual(["2026-11-02", "2026-11-08"]);
        expect(fechasIntervalo("000005", hoy)).toEqual(["2026-11-01", "2026-11-30"]);
        expect(fechasIntervalo("000006", hoy)).toEqual(["2026-10-01", "2026-10-31"]);
        expect(fechasIntervalo("000008", hoy)).toEqual(["2025-01-01", "2025-12-31"]);
        expect(fechasIntervalo("000010", hoy)).toEqual(["", "2026-11-11"]);
        expect(fechasIntervalo("", hoy)).toBeNull();
    });

    test("al elegir intervalo se rellenan las fechas", () => {
        const ficha = { ...fichaNueva(pestaña), intervalo: "000007" };
        expect(conIntervalo(ficha, "intervalo", hoy)).toMatchObject({
            fecha_desde: "2026-01-01",
            fecha_hasta: "2026-12-31",
        });
        expect(conIntervalo(ficha, "cliente_id", hoy)).toBe(ficha);
    });
});

describe("resultado", () => {
    test("texto de las celdas como en el PDF", () => {
        expect(textoCelda("2026-03-01", "fecha")).toBe("01/03/2026");
        expect(textoCelda(12345.6, "moneda")).toBe("12.345,60");
        expect(textoCelda(2, "cantidad")).toBe("2");
        expect(textoCelda(2.5, "cantidad")).toBe("2,50");
        expect(textoCelda(null, "moneda")).toBe("");
        expect(textoCelda("P1", "texto")).toBe("P1");
    });

    test("mapeo desde la API", () => {
        const resultado = resultadoDesdeApi({
            modo: "resumen",
            titulo: "Resumen",
            columnas: [{ id: "codigo", cabecera: "Código", tipo: "texto" }],
            columnas_lineas: [],
            filas: [{ tipo: "documento", celdas: ["P1"], lineas: [] }],
            total_documentos: 1,
        });
        expect(resultado.totalDocumentos).toBe(1);
        expect(resultado.columnasLineas).toEqual([]);
        expect(resultado.filas[0].celdas).toEqual(["P1"]);
    });

    test("nombre del fichero", () => {
        expect(nombreFicheroInforme(pestaña, { descripcion: "Ventas Año" }, "detalle")).toBe(
            "prueba-detalle-ventas-ano.pdf"
        );
    });
});

describe("piezas de compras", () => {
    test("el intervalo de entrada rellena las fechas de entrada", () => {
        const ficha = { ...fichaNueva(pestaña), intervalo_entrada: "000001" };
        expect(conIntervalo(ficha, "intervalo_entrada", new Date(2026, 1, 10))).toMatchObject({
            fecha_entrada_desde: "2026-02-10",
            fecha_entrada_hasta: "2026-02-10",
        });
    });

    test("modos por defecto: detalle y resumen", () => {
        expect(MODOS_POR_DEFECTO.map((m) => m.modo)).toEqual(["detalle", "resumen"]);
    });
});

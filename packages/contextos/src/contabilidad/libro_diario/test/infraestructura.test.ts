import { describe, expect, test } from "vitest";
import { CambiosLibroDiario, LibroDiario } from "../diseño.ts";
import { nuevoLibroDiarioInicial } from "../dominio.ts";
import {
    cambiosLibroDiarioAApi,
    libroDiarioDesdeApi,
    LibroDiarioApi,
    nuevoLibroDiarioAApi,
    resultadoDesdeApi,
    ResultadoLibroDiarioApi,
} from "../infraestructura.ts";

const fichaApi: LibroDiarioApi = {
    id: 7,
    descripcion: "Diario 2026 completo",
    tipo: "Borrador",
    ejercicio_id: "2026",
    fecha_desde: "2026-01-01",
    fecha_hasta: "2026-12-31",
    asientos: { todos: false, desde: 1, hasta: 4820 },
    subcuentas: { todas: true, desde: "10000000", hasta: "77900000" },
    datos_iva: true,
    agrupar_meses: false,
    resumen_mensual: false,
    ordenes: [
        { criterio: "Fecha", sentido: "Descendente" },
        { criterio: "Subcuenta", sentido: "Ascendente" },
    ],
};

describe("ficha del informe", () => {
    test("la API anida los rangos y el frontend los aplana", () => {
        const ficha = libroDiarioDesdeApi(fichaApi);

        expect(ficha.id).toBe("7");
        expect(ficha.ejercicioId).toBe("2026");
        expect(ficha.todosAsientos).toBe(false);
        expect(ficha.asientoDesde).toBe("1");
        expect(ficha.asientoHasta).toBe("4820");
        expect(ficha.todasSubcuentas).toBe(true);
        expect(ficha.subcuentaHasta).toBe("77900000");
        expect(ficha.datosIva).toBe(true);
    });

    test("los niveles de orden que faltan quedan como No ordenar", () => {
        const ficha = libroDiarioDesdeApi(fichaApi);

        expect([ficha.orden1, ficha.tipoOrden1]).toEqual([
            "Fecha",
            "Descendente",
        ]);
        expect([ficha.orden2, ficha.tipoOrden2]).toEqual([
            "Subcuenta",
            "Ascendente",
        ]);
        expect([ficha.orden3, ficha.tipoOrden3]).toEqual([
            "No ordenar",
            "Ascendente",
        ]);
    });
});

describe("alta de la ficha", () => {
    test("manda los rangos como objeto", () => {
        const api = nuevoLibroDiarioAApi(nuevoLibroDiarioInicial("2026"));

        expect(api.ejercicio_id).toBe("2026");
        expect(api.asientos).toEqual({ todos: true, desde: null, hasta: null });
        expect(api.subcuentas).toEqual({
            todas: true,
            desde: null,
            hasta: null,
        });
    });

    test("con todos marcado no manda el rango aunque haya texto", () => {
        const api = nuevoLibroDiarioAApi({
            ...nuevoLibroDiarioInicial("2026"),
            asientoDesde: "10",
            asientoHasta: "20",
        });

        expect(api.asientos.desde).toBeNull();
    });

    test("el nivel de orden por defecto viaja como lista", () => {
        const api = nuevoLibroDiarioAApi(nuevoLibroDiarioInicial("2026"));

        expect(api.ordenes).toEqual([
            { criterio: "Asiento", sentido: "Ascendente" },
        ]);
    });
});

describe("cambios de la ficha", () => {
    const informe: LibroDiario = libroDiarioDesdeApi(fichaApi);

    test("un campo suelto viaja solo", () => {
        const cambios: CambiosLibroDiario = { descripcion: "Revisado" };

        expect(cambiosLibroDiarioAApi(cambios, informe)).toEqual({
            descripcion: "Revisado",
        });
    });

    test("tocar un extremo del rango manda el rango entero", () => {
        const cambios: CambiosLibroDiario = { asientoHasta: "99" };
        const api = cambiosLibroDiarioAApi(cambios, {
            ...informe,
            asientoHasta: "99",
        });

        expect(api.asientos).toEqual({ todos: false, desde: 1, hasta: 99 });
    });

    test("tocar un nivel de orden manda los tres", () => {
        const cambios: CambiosLibroDiario = { orden3: "Asiento" };
        const api = cambiosLibroDiarioAApi(cambios, {
            ...informe,
            orden3: "Asiento",
        });

        expect(api.ordenes).toEqual([
            { criterio: "Fecha", sentido: "Descendente" },
            { criterio: "Subcuenta", sentido: "Ascendente" },
            { criterio: "Asiento", sentido: "Ascendente" },
        ]);
    });

    test("los niveles No ordenar no viajan", () => {
        const api = cambiosLibroDiarioAApi({ orden2: "No ordenar" }, {
            ...informe,
            orden2: "No ordenar",
        });

        expect(api.ordenes).toEqual([
            { criterio: "Fecha", sentido: "Descendente" },
        ]);
    });
});

describe("resultado del informe", () => {
    const resultadoApi: ResultadoLibroDiarioApi = {
        datos: [
            {
                partida_id: 11,
                asiento_id: 5,
                asiento_numero: 42,
                fecha: "2026-06-15",
                concepto_asiento: "Venta",
                codigo_subcuenta: "57000000",
                concepto: "Cobro",
                debe: 1000,
                haber: 0,
            },
        ],
        total: 1,
        totales: { debe: 1000, haber: 1000, descuadre: 0 },
    };

    test("mapea las líneas y los totales", () => {
        const resultado = resultadoDesdeApi(resultadoApi);

        expect(resultado.datos[0].asientoNumero).toBe(42);
        expect(resultado.datos[0].codigoSubcuenta).toBe("57000000");
        expect(resultado.totales).toEqual({
            debe: 1000,
            haber: 1000,
            descuadre: 0,
        });
    });

    test("sin datos de I.V.A. los campos opcionales quedan nulos", () => {
        const resultado = resultadoDesdeApi(resultadoApi);

        expect(resultado.datos[0].baseImponible).toBeNull();
        expect(resultado.datos[0].iva).toBeNull();
    });

    test("sin resumen mensual ni totales por mes, listas vacías", () => {
        const resultado = resultadoDesdeApi(resultadoApi);

        expect(resultado.totalesMes).toEqual([]);
        expect(resultado.resumenMensual).toEqual([]);
    });
});

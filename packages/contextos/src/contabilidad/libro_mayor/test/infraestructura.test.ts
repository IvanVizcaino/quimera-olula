import { describe, expect, test } from "vitest";
import { CambiosLibroMayor } from "../diseño.ts";
import { nuevoLibroMayorInicial } from "../dominio.ts";
import {
    cambiosLibroMayorAApi,
    libroMayorDesdeApi,
    LibroMayorApi,
    nuevoLibroMayorAApi,
    resultadoDesdeApi,
    ResultadoLibroMayorApi,
} from "../infraestructura.ts";

const fichaApi: LibroMayorApi = {
    id: 7,
    descripcion: "Mayor 2026",
    ejercicio_id: "2026",
    fecha_desde: "2026-01-01",
    fecha_hasta: "2026-12-31",
    subcuentas: { todas: false, desde: "10000000", hasta: "57000000" },
    saldo_inicial: false,
    excluir_partidas_cero: true,
    orden: { criterio: "Asiento", sentido: "Descendente" },
};

describe("ficha del informe", () => {
    test("la API anida el rango y el orden, y el frontend los aplana", () => {
        const ficha = libroMayorDesdeApi(fichaApi);

        expect(ficha.id).toBe("7");
        expect(ficha.todasSubcuentas).toBe(false);
        expect(ficha.subcuentaDesde).toBe("10000000");
        expect(ficha.subcuentaHasta).toBe("57000000");
        expect(ficha.saldoInicial).toBe(false);
        expect(ficha.excluirPartidasCero).toBe(true);
        expect(ficha.orden).toBe("Asiento");
        expect(ficha.tipoOrden).toBe("Descendente");
    });
});

describe("alta de la ficha", () => {
    test("manda el rango y el orden como objeto", () => {
        const api = nuevoLibroMayorAApi(nuevoLibroMayorInicial("2026"));

        expect(api.subcuentas).toEqual({
            todas: true,
            desde: null,
            hasta: null,
        });
        expect(api.orden).toEqual({
            criterio: "Fecha",
            sentido: "Ascendente",
        });
    });

    test("con todas marcado no manda el rango aunque haya texto", () => {
        const api = nuevoLibroMayorAApi({
            ...nuevoLibroMayorInicial("2026"),
            subcuentaDesde: "10000000",
        });

        expect(api.subcuentas.desde).toBeNull();
    });
});

describe("cambios de la ficha", () => {
    const informe = libroMayorDesdeApi(fichaApi);

    test("un campo suelto viaja solo", () => {
        const cambios: CambiosLibroMayor = { descripcion: "Revisado" };

        expect(cambiosLibroMayorAApi(cambios, informe)).toEqual({
            descripcion: "Revisado",
        });
    });

    test("tocar un extremo del rango manda el rango entero", () => {
        const api = cambiosLibroMayorAApi({ subcuentaHasta: "43000000" }, {
            ...informe,
            subcuentaHasta: "43000000",
        });

        expect(api.subcuentas).toEqual({
            todas: false,
            desde: "10000000",
            hasta: "43000000",
        });
    });

    test("tocar el sentido manda también el criterio", () => {
        const api = cambiosLibroMayorAApi({ tipoOrden: "Ascendente" }, {
            ...informe,
            tipoOrden: "Ascendente",
        });

        expect(api.orden).toEqual({
            criterio: "Asiento",
            sentido: "Ascendente",
        });
    });
});

describe("resultado del informe", () => {
    const resultadoApi: ResultadoLibroMayorApi = {
        cabecera: {
            subcuenta_id: 1,
            codigo_subcuenta: "57000000",
            descripcion_subcuenta: "Caja",
            saldo_inicial: 0,
            saldo_final: 1000,
        },
        lineas: [],
        total: 1,
        subcuentas: [
            {
                cabecera: {
                    subcuenta_id: 1,
                    codigo_subcuenta: "57000000",
                    descripcion_subcuenta: "Caja",
                    saldo_inicial: 0,
                    saldo_final: 1000,
                },
                lineas: [
                    {
                        partida_id: 11,
                        asiento_id: 5,
                        asiento_numero: 42,
                        fecha: "2026-06-15",
                        concepto: "Cobro",
                        debe: 1000,
                        haber: 0,
                        saldo: 1000,
                    },
                ],
                total: 1,
                total_debe: 1000,
                total_haber: 0,
            },
        ],
    };

    test("mapea un bloque por subcuenta", () => {
        const resultado = resultadoDesdeApi(resultadoApi);

        expect(resultado.subcuentas).toHaveLength(1);
        expect(resultado.subcuentas[0].cabecera.codigoSubcuenta).toBe(
            "57000000"
        );
        expect(resultado.subcuentas[0].lineas[0].saldo).toBe(1000);
        expect(resultado.subcuentas[0].totalDebe).toBe(1000);
    });

    test("sin bloques devuelve lista vacía", () => {
        const resultado = resultadoDesdeApi({
            ...resultadoApi,
            subcuentas: undefined,
        });

        expect(resultado.subcuentas).toEqual([]);
    });
});

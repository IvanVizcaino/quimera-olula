import { describe, expect, test } from "vitest";
import { CambiosLibroFacturasRecibidas } from "../diseño.ts";
import { nuevoLibroFacturasRecibidasInicial } from "../dominio.ts";
import {
    cambiosLibroFacturasRecibidasAApi,
    libroFacturasRecibidasDesdeApi,
    LibroFacturasRecibidasApi,
    nuevoLibroFacturasRecibidasAApi,
} from "../infraestructura.ts";

const fichaApi: LibroFacturasRecibidasApi = {
    id: 7,
    descripcion: "Facturas recibidas 1T",
    ejercicio_id: "2026",
    fecha_desde: "2026-01-01",
    fecha_hasta: "2026-03-31",
    filtro: { todos: false, porcentaje: 21, con_iva: true },
    presentacion: {
        mostrar_total_factura: false,
        mostrar_nif: true,
        mostrar_documento: false,
        mostrar_asiento: true,
        numeracion_automatica: true,
        numero_desde: 100,
    },
    codigo_serie: "A",
};

describe("ficha del informe", () => {
    test("la API anida filtro y presentación, y el frontend los aplana", () => {
        const ficha = libroFacturasRecibidasDesdeApi(fichaApi);

        expect(ficha.id).toBe("7");
        expect(ficha.todos).toBe(false);
        expect(ficha.porcentaje).toBe("21");
        expect(ficha.conIva).toBe(true);
        expect(ficha.mostrarTotalFactura).toBe(false);
        expect(ficha.numeracionAutomatica).toBe(true);
        expect(ficha.numeroDesde).toBe("100");
    });
});

describe("alta de la ficha", () => {
    test("manda filtro y presentación como objeto", () => {
        const api = nuevoLibroFacturasRecibidasAApi(
            nuevoLibroFacturasRecibidasInicial("2026")
        );

        expect(api.filtro).toEqual({
            todos: true,
            porcentaje: null,
            con_iva: false,
        });
        expect(api.presentacion.numero_desde).toBe(1);
    });

    test("con todos los tipos marcado el porcentaje no viaja", () => {
        const api = nuevoLibroFacturasRecibidasAApi({
            ...nuevoLibroFacturasRecibidasInicial("2026"),
            porcentaje: "21",
        });

        expect(api.filtro.porcentaje).toBeNull();
    });
});

describe("cambios de la ficha", () => {
    const informe = libroFacturasRecibidasDesdeApi(fichaApi);

    test("un campo suelto viaja solo", () => {
        const cambios: CambiosLibroFacturasRecibidas = {
            descripcion: "Revisado",
        };

        expect(cambiosLibroFacturasRecibidasAApi(cambios, informe)).toEqual({
            descripcion: "Revisado",
        });
    });

    test("tocar una pieza del filtro manda el filtro entero", () => {
        const api = cambiosLibroFacturasRecibidasAApi(
            { conIva: false },
            { ...informe, conIva: false }
        );

        expect(api.filtro).toEqual({
            todos: false,
            porcentaje: 21,
            con_iva: false,
        });
    });

    test("tocar una opción de presentación manda todas", () => {
        const api = cambiosLibroFacturasRecibidasAApi(
            { mostrarNif: false },
            { ...informe, mostrarNif: false }
        );

        expect(api.presentacion).toEqual({
            mostrar_total_factura: false,
            mostrar_nif: false,
            mostrar_documento: false,
            mostrar_asiento: true,
            numeracion_automatica: true,
            numero_desde: 100,
        });
    });
});

describe("serie de las recibidas", () => {
    const informe = libroFacturasRecibidasDesdeApi(fichaApi);

    test("la ficha la trae de la API", () => {
        expect(informe.codigoSerie).toBe("A");
    });

    test("vacía viaja como nula: todas las series", () => {
        const api = cambiosLibroFacturasRecibidasAApi(
            { codigoSerie: "" },
            { ...informe, codigoSerie: "" }
        );

        expect(api.codigo_serie).toBeNull();
    });
});

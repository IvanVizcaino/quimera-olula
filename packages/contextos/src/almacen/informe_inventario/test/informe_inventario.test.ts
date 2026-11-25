import { cambiosFicha, fichaAApi, fichaDesdeApi, fichaNueva } from "#/comun/informe_documentos/dominio.ts";
import { describe, expect, test } from "vitest";
import { criteriosResultado, importe, nombreFicheroInventario } from "../dominio.ts";
import { resultadoInventarioDesdeApi } from "../infraestructura.ts";
import { ajustarInventario, INFORME_INVENTARIO } from "../pestañas.ts";

const api = {
    titulo: "Inventario Valorado de Almacenes",
    valorado: true,
    fecha: "2026-11-24",
    tipo_valoracion: "PVP",
    por_pvp: 10,
    grupos: [
        {
            almacen_id: "ALG",
            almacen: "ALMACEN GENERAL",
            direccion: "C/ Mayor 1",
            poblacion: "Algeciras",
            filas: [{ referencia: "A", descripcion: "Uno", cantidad: 1.5, precio: 2, valor: 3 }],
            total: 3,
        },
    ],
    total: 3,
    total_articulos: 1,
};

describe("Fichas del informe de inventario", () => {
    test("la ficha nueva lleva los valores por defecto de Eneboo", () => {
        const ficha = fichaNueva(INFORME_INVENTARIO);
        expect(ficha.actual).toBe(true);
        expect(ficha.incluir_sin_stock).toBe(true);
        expect(ficha.orden_almacen).toBe("No ordenar");
    });

    test("el informe sin valorar no tiene criterios de valoración", () => {
        const ids = INFORME_INVENTARIO.filas.flat().map((c) => c.id);
        expect(ids).not.toContain("tipo_valoracion");
        expect(ids).not.toContain("por_pvp");
        expect(fichaAApi(INFORME_INVENTARIO, fichaNueva(INFORME_INVENTARIO))).not.toHaveProperty("tipo_valoracion");
    });

    test("a la API: vacíos a null y casillas booleanas", () => {
        const ficha = { ...fichaNueva(INFORME_INVENTARIO), descripcion: "Todo" };
        expect(fichaAApi(INFORME_INVENTARIO, ficha)).toMatchObject({
            descripcion: "Todo",
            almacen_id: null,
            a_fecha: null,
            actual: true,
            orden_articulo: "No ordenar",
        });
    });

    test("desde la API y cambios para el PATCH", () => {
        const ficha = fichaDesdeApi(INFORME_INVENTARIO)({
            id: 3, descripcion: "ALG a fecha", almacen_id: "ALG", actual: false, a_fecha: "2026-11-01",
            incluir_sin_stock: true, orden_almacen: "Código",
        });
        expect(ficha).toMatchObject({ id: "3", almacen_id: "ALG", actual: false, a_fecha: "2026-11-01", familia_id: "" });
        expect(cambiosFicha(INFORME_INVENTARIO, ficha, { ...ficha, actual: true, a_fecha: "" }))
            .toEqual({ actual: true, a_fecha: null });
    });

    test("al marcar «Actual» se vacía la fecha; la fecha solo se edita sin «Actual»", () => {
        const ficha = { ...fichaNueva(INFORME_INVENTARIO), actual: true, a_fecha: "2026-11-01" };
        expect(ajustarInventario(ficha, "actual").a_fecha).toBe("");
        expect(ajustarInventario({ ...ficha, actual: false }, "actual").a_fecha).toBe("2026-11-01");
        const aFecha = INFORME_INVENTARIO.filas.flat().find((c) => c.id === "a_fecha")!;
        expect(aFecha.activo!(ficha)).toBe(false);
        expect(aFecha.activo!({ ...ficha, actual: false })).toBe(true);
    });
});

describe("Resultado del informe de inventario", () => {
    test("convierte la respuesta de la API", () => {
        const resultado = resultadoInventarioDesdeApi(api);
        expect(resultado.grupos[0]).toMatchObject({ almacenId: "ALG", poblacion: "Algeciras", total: 3 });
        expect(resultado.grupos[0].filas[0]).toEqual({ referencia: "A", descripcion: "Uno", cantidad: 1.5, precio: 2, valor: 3 });
        expect(resultado.totalArticulos).toBe(1);
        expect(resultado.porPvp).toBe(10);
    });

    test("sin valorar: precio, valor y totales a null", () => {
        const resultado = resultadoInventarioDesdeApi({
            ...api, valorado: false, tipo_valoracion: null, por_pvp: null, total: null, fecha: null,
            grupos: [{ ...api.grupos[0], total: null, filas: [{ referencia: "A", descripcion: null, cantidad: 2, precio: null, valor: null }] }],
        });
        expect(resultado.grupos[0].filas[0].precio).toBeNull();
        expect(resultado.total).toBeNull();
        expect(criteriosResultado(resultado)).toBe("Stock actual · 1 artículo");
    });

    test("criterios, importes y nombre de fichero", () => {
        const resultado = resultadoInventarioDesdeApi({ ...api, total_articulos: 1234 });
        expect(criteriosResultado(resultado)).toBe("Stock a 24/11/2026 · Valoración: PVP + 10 % · 1.234 artículos");
        expect(importe(1234.5)).toBe("1.234,50");
        expect(importe(null)).toBe("");
        expect(nombreFicheroInventario(INFORME_INVENTARIO, { descripcion: "Almacén Algeciras" }, "xlsx"))
            .toBe("inventario-almacen-algeciras.xlsx");
    });
});

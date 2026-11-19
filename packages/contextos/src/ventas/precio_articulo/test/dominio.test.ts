import { afterEach, describe, expect, test } from "vitest";
import { muestraPreciosArticulo, pvpIgnorado, textoTramo, tramoValido } from "../dominio.ts";
import {
    cambiosPrecioArticuloAApi,
    nuevoPrecioArticuloAApi,
    precioArticuloDesdeApi,
} from "../infraestructura.ts";

const condicion = (cantidadMin: number, cantidadMax: number, dtoPorcentual = 0, pvp = 0) => ({
    cantidadMin, cantidadMax, dtoPorcentual, pvp,
});

describe("precio por artículo", () => {
    test("un extremo a 0 no limita el tramo", () => {
        expect(tramoValido(condicion(0, 0))).toBe(true);
        expect(tramoValido(condicion(50, 0))).toBe(true);
        expect(tramoValido(condicion(10, 50))).toBe(true);
        expect(tramoValido(condicion(50, 10))).toBeTypeOf("string");
    });

    test("texto del tramo", () => {
        expect(textoTramo(condicion(0, 0))).toBe("Todas");
        expect(textoTramo(condicion(10, 0))).toBe("Desde 10");
        expect(textoTramo(condicion(0, 9))).toBe("Hasta 9");
        expect(textoTramo(condicion(10, 50))).toBe("10 – 50");
    });

    test("con descuento el precio neto no se usa", () => {
        expect(pvpIgnorado(condicion(0, 0, 5, 3))).toBe(true);
        expect(pvpIgnorado(condicion(0, 0, 0, 3))).toBe(false);
    });

    test("en la API, sin límite es null; en el dominio, 0", () => {
        const api = nuevoPrecioArticuloAApi("C1", {
            articuloId: "REF", descripcionArticulo: "x", ...condicion(0, 20, 0, 2.5),
        });
        expect(api).toEqual({
            cliente_id: "C1", articulo_id: "REF",
            cantidad_min: null, cantidad_max: 20, dto_porcentual: 0, pvp: 2.5,
        });

        expect(cambiosPrecioArticuloAApi({ cantidadMax: 0 })).toEqual({ cantidad_max: null });

        expect(precioArticuloDesdeApi({
            id: "1", cliente_id: "C1", articulo_id: "REF", descripcion_articulo: null,
            cantidad_min: null, cantidad_max: 9, dto_porcentual: 0, pvp: 2,
        })).toMatchObject({ descripcionArticulo: "", cantidadMin: 0, cantidadMax: 9 });
    });
});

describe("pestaña de precios por artículo en el cliente", () => {
    const conWhoami = (fuentes: string[], permisos: { id_regla: string; valor: boolean }[] = []) =>
        localStorage.setItem("whoami", JSON.stringify({
            permisos,
            config: { ventas: { precio_articulo: fuentes } },
        }));

    afterEach(() => localStorage.clear());

    test("se ve si la secuencia de precios usa precios_articulos", () => {
        conWhoami(["precios_articulos", "tarifa_grupo", "ficha_articulo"]);
        expect(muestraPreciosArticulo()).toBe(true);
    });

    test("no se ve con otra secuencia", () => {
        conWhoami(["tarifa_grupo", "ficha_articulo"]);
        expect(muestraPreciosArticulo()).toBe(false);
    });

    test("no se ve si el usuario no tiene permiso", () => {
        conWhoami(["precios_articulos", "ficha_articulo"],
            [{ id_regla: "ventas.precio_articulo", valor: false }]);
        expect(muestraPreciosArticulo()).toBe(false);
    });
});

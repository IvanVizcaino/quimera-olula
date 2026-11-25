import { afterEach, describe, expect, test } from "vitest";
import { fuentesPrecioArticulo } from "./dominio.ts";

const conWhoami = (whoami: unknown) =>
    localStorage.setItem("whoami", JSON.stringify(whoami));

describe("fuentesPrecioArticulo", () => {
    afterEach(() => localStorage.clear());

    test("devuelve las fuentes de precio en orden", () => {
        conWhoami({
            config: { ventas: { precio_articulo: ["precios_articulos", "tarifa_grupo", "ficha_articulo"] } },
        });

        expect(fuentesPrecioArticulo()).toEqual(["precios_articulos", "tarifa_grupo", "ficha_articulo"]);
    });

    test("sin whoami o sin la clave devuelve una lista vacía", () => {
        expect(fuentesPrecioArticulo()).toEqual([]);

        conWhoami({ config: { tesoreria: { pago_diferido: true } } });
        expect(fuentesPrecioArticulo()).toEqual([]);
    });
});

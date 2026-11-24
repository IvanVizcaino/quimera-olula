import { describe, expect, it } from "vitest";
import { urlFicha, urlListado, urlMapa } from "../fichas.ts";

describe("URLs de las fichas del almacén", () => {
    it("fichas por id, codificadas; sin id, null", () => {
        expect(urlFicha.articulo("A/1")).toBe("/almacen/articulo?id=A%2F1");
        expect(urlFicha.ubicacion(null)).toBeNull();
    });

    it("listados con filtro exacto", () => {
        expect(urlListado.stockDeArticulo("90197")).toBe("/almacen/stock?articulo_id==__90197");
        expect(urlListado.ubicacionesDePasillo("5")).toBe("/almacen/ubicaciones?pasillo_id==__5");
    });

    it("mapa con su foco", () => {
        expect(urlMapa()).toBe("/almacen/mapa");
        expect(urlMapa({ almacenId: "ALG", ubicacionId: "17" })).toBe("/almacen/mapa?almacen_id=ALG&ubicacion_id=17");
    });
});

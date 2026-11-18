import { avisoIvaDefecto, configAlmacenPorDefecto, conImpuestoDefecto, impuestoDefecto } from "#/almacen/config/dominio.ts";
import { configAlmacenAApi, configAlmacenDesdeApi } from "#/almacen/config/infraestructura.ts";
import { describe, expect, test } from "vitest";

describe("configuración de almacén", () => {
    test("por defecto no se usa IVA por defecto, como en el escritorio", () => {
        expect(configAlmacenPorDefecto).toEqual({ impuestoId: "", usarIvaDefecto: false });
    });

    test("sin impuesto va como nulo a la API", () => {
        const api = { impuesto_id: null, usar_iva_defecto: true };
        const config = configAlmacenDesdeApi(api);
        expect(config.impuestoId).toBe("");
        expect(configAlmacenAApi(config)).toEqual(api);
    });

    test("avisa si se usa el IVA por defecto sin elegir impuesto", () => {
        expect(avisoIvaDefecto({ impuestoId: "", usarIvaDefecto: true })).not.toBe("");
        expect(avisoIvaDefecto({ impuestoId: "GEN", usarIvaDefecto: true })).toBe("");
        expect(avisoIvaDefecto({ impuestoId: "", usarIvaDefecto: false })).toBe("");
    });

    test("el artículo nuevo toma el impuesto de la configuración, con o sin la casilla", () => {
        expect(impuestoDefecto({ impuestoId: "RED", usarIvaDefecto: false }, "articulo")).toBe("RED");
        expect(impuestoDefecto({ impuestoId: "RED", usarIvaDefecto: true }, "articulo")).toBe("RED");
        expect(impuestoDefecto({ impuestoId: "", usarIvaDefecto: true }, "articulo")).toBeNull();
    });

    test("propone el impuesto solo si el campo está vacío", () => {
        expect(conImpuestoDefecto({ grupo: "" }, "grupo", "RED")).toEqual({ grupo: "RED" });
        expect(conImpuestoDefecto({ grupo: null }, "grupo", "RED")).toEqual({ grupo: "RED" });
        expect(conImpuestoDefecto({ grupo: "GEN" }, "grupo", "RED")).toEqual({ grupo: "GEN" });
        const modelo = { grupo: "" };
        expect(conImpuestoDefecto(modelo, "grupo", null)).toBe(modelo);
    });

    test("la línea nueva solo toma el impuesto con «Utilizar I.V.A. por defecto»", () => {
        expect(impuestoDefecto({ impuestoId: "RED", usarIvaDefecto: true }, "linea")).toBe("RED");
        expect(impuestoDefecto({ impuestoId: "RED", usarIvaDefecto: false }, "linea")).toBeNull();
        expect(impuestoDefecto({ impuestoId: "", usarIvaDefecto: true }, "linea")).toBeNull();
    });
});

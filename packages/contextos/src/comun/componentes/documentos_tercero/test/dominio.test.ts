import { describe, expect, it } from "vitest";
import { criteriaDocumentos, efectoEvento, ordenDocumentos } from "../dominio.ts";

describe("Documentos de un tercero", () => {
    it("ordena por fecha y código descendentes", () => {
        expect(ordenDocumentos()).toEqual(["fecha", "DESC", "codigo", "DESC"]);
        expect(ordenDocumentos("fecha_emision")).toEqual(["fecha_emision", "DESC", "codigo", "DESC"]);
    });

    it("el criteria lleva el filtro fijo y empieza en la primera página", () => {
        const c = criteriaDocumentos([["cliente_id", "=", "000005"]], ordenDocumentos());
        expect(c.filtro).toEqual([["cliente_id", "=", "000005"]]);
        expect(c.orden).toEqual(["fecha", "DESC", "codigo", "DESC"]);
        expect(c.paginacion.pagina).toBe(1);
    });

    it("recarga o cierra la ficha según el evento que publica", () => {
        expect(efectoEvento("pedido_cambiado")).toBe("recargar");
        expect(efectoEvento("factura_cambiada")).toBe("recargar");
        expect(efectoEvento("albaran_borrado")).toBe("recargar_y_cerrar");
        expect(efectoEvento("factura_deseleccionada")).toBe("cerrar");
        expect(efectoEvento("linea_seleccionada")).toBeNull();
    });
});

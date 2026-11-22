import { beforeEach, describe, expect, it } from "vitest";
import { pluginsActivos } from "../menu.ts";

const conPlugins = (plugins: Record<string, string>) =>
    localStorage.setItem("whoami", JSON.stringify({ plugins }));

describe("pluginsActivos", () => {
    beforeEach(() => localStorage.clear());

    it("sin plugin la entrada se ve", () => {
        expect(pluginsActivos({ nombre: "x" })).toBe(true);
    });

    it("nombre suelto exige estado activo", () => {
        conPlugins({ sga: "activo" });
        expect(pluginsActivos({ nombre: "x", plugin: "sga" })).toBe(true);
        conPlugins({ sga: "inactivo" });
        expect(pluginsActivos({ nombre: "x", plugin: "sga" })).toBe(false);
    });

    it("objeto exige alguno de los estados indicados", () => {
        const e = { nombre: "x", plugin: { estado_expedicion_factura: ["firma", "emision"] } };
        conPlugins({ estado_expedicion_factura: "firma" });
        expect(pluginsActivos(e)).toBe(true);
        conPlugins({ estado_expedicion_factura: "emision" });
        expect(pluginsActivos(e)).toBe(true);
        conPlugins({ estado_expedicion_factura: "basico" });
        expect(pluginsActivos(e)).toBe(false);
        conPlugins({ estado_expedicion_factura: "inactivo" });
        expect(pluginsActivos(e)).toBe(false);
    });
});

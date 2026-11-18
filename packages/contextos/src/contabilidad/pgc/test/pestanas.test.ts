import { describe, expect, it } from "vitest";
import { menuContabilidad } from "../../menu.ts";
import { RouterFactoryContabilidadOlula } from "../../router_factory.ts";
import { PantallaPgc, PantallaPgcCodigosBalance } from "../Pgc.tsx";
import { indicePestanaPgc, pestanasPgc, tituloPestanaPgc } from "../pestanas.ts";

describe("pestañas del PGC", () => {
    it("incluye la pestaña de códigos de balance 2008 con el título pedido, la última", () => {
        expect(tituloPestanaPgc("codigos_balance")).toBe("Codigos de balance 2008");
        expect(indicePestanaPgc("codigos_balance")).toBe(pestanasPgc.length - 1);
    });

    it("mantiene las pestañas previas en su orden y Subcuentas como inicial", () => {
        expect(pestanasPgc.map((p) => p.titulo).slice(0, 5)).toEqual([
            "Subcuentas", "Cuentas", "Cuentas especiales", "Subgrupos", "Grupos",
        ]);
        expect(indicePestanaPgc()).toBe(0);
        expect(indicePestanaPgc("no_existe")).toBe(0);
        expect(indicePestanaPgc("grupos")).toBe(4);
    });
});

describe("menú y rutas de códigos de balance", () => {
    it("el menú ya no tiene entrada propia de códigos de balance", () => {
        const urls = Object.values(menuContabilidad)
            .map((e) => (e as { url?: string }).url)
            .filter(Boolean);
        expect(urls).not.toContain("/contabilidad/codigo_balance");
        expect(Object.keys(menuContabilidad)).not.toContain("Contabilidad/Códigos de balance 2008");
        expect(urls).toContain("/contabilidad/pgc");
    });

    it("la ruta antigua abre el PGC en la pestaña de códigos de balance", () => {
        const router = RouterFactoryContabilidadOlula.router;
        expect(router["contabilidad/pgc"]).toBe(PantallaPgc);
        expect(router["contabilidad/codigo_balance"]).toBe(PantallaPgcCodigosBalance);
    });
});

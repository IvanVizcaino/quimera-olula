import { aplanarMenu, agruparPorArea } from "@olula/componentes/menu/dominio.ts";
import { crearMenu, ElementoMenu, MenuContextFactory } from "@olula/lib/menu.ts";
import { describe, expect, test } from "vitest";
import { menuComun } from "../menu.ts";

const todo = () => true;

describe("menú «Tablas generales» (área Organización)", () => {
    const menu = crearMenu({ Comun: { menu: menuComun } as unknown as MenuContextFactory }) as ElementoMenu[];
    const grupo = menu.find((e) => e.nombre === "Tablas generales") as (ElementoMenu & { area?: string }) | undefined;

    test("es un grupo del área Organización", () => {
        expect(grupo).toBeDefined();
        expect(grupo?.area).toBe("Organización");
        const areas = agruparPorArea(menu as { area?: string; nombre: string }[]);
        const organizacion = areas.find((a) => a.area === "Organización");
        expect(organizacion?.grupos.map((g) => g.nombre)).toContain("Tablas generales");
    });

    test("sus pantallas cuelgan del grupo", () => {
        const pantallas = aplanarMenu(menu, todo).filter((p) => p.grupo === "Tablas generales");
        expect(pantallas.map((p) => p.nombre)).toEqual([
            "Países", "Provincias", "Zonas geográficas", "Divisas",
        ]);
        for (const pantalla of pantallas) {
            expect(pantalla.url.startsWith("/comun/")).toBe(true);
        }
    });
});

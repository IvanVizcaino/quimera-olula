import { crearMenu, ElementoMenu, ElementoMenuPadre, MenuContextFactory, pluginsActivos } from "@olula/lib/menu.ts";
import { FactoryOlula } from "@olula/olula/factory.ts";
import { RouterFactoryOlula } from "@olula/olula/router_factory.ts";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { FactoryOlulaMax } from "../src/factory.ts";
import { RouterFactoryOlulaMax } from "../src/router_factory.ts";

// Plugins activos de olula_max en el servidor (apps/olula_max/_dependencias/plugins.ini),
// tal como los devuelve whoami.
const PLUGINS_OLULA_MAX = {
    produccion: "activo",
    sga: "activo",
    remesa_pago: "activo",
    presupuesto_parcial: "activo",
    transporte_dachser: "activo",
    transporte_correose: "activo",
    deca: "activo",
    trazabilidad: "activa",
};

const menuDe = (factory: object) =>
    crearMenu(factory as unknown as Record<string, MenuContextFactory>) as ElementoMenuPadre[];

const grupo = (menu: ElementoMenuPadre[], nombre: string) => menu.find((e) => e.nombre === nombre);

describe("app olula_max", () => {
    const menu = menuDe(new FactoryOlulaMax());
    const grupos = menu.map((e) => e.nombre);

    beforeEach(() => localStorage.setItem("whoami", JSON.stringify({ plugins: PLUGINS_OLULA_MAX })));
    afterEach(() => localStorage.removeItem("whoami"));

    test("tiene el mismo menú que olula", () => {
        expect(menu).toEqual(menuDe(new FactoryOlula()));
        for (const g of ["Inicio", "Ventas", "Compras", "Almacén", "Producción", "CRM", "Contabilidad",
            "Tesorería", "Fiscalidad", "RRHH", "Proyectos", "Empresa", "Tablas generales", "Administración"]) {
            expect(grupos).toContain(g);
        }
    });

    test("tiene las mismas rutas que olula", () => {
        expect(Object.keys(new RouterFactoryOlulaMax())).toEqual(Object.keys(new RouterFactoryOlula()));
    });

    test("con los plugins de olula_max se ven Producción y lo del SGA", () => {
        const produccion = grupo(menu, "Producción")!;
        expect(pluginsActivos(produccion)).toBe(true);
        expect(produccion.subelementos.map((e) => e.nombre)).toContain("Órdenes de producción");
        expect(produccion.subelementos.every(pluginsActivos)).toBe(true);

        const almacen = grupo(menu, "Almacén")!.subelementos;
        const visibles = almacen.filter(pluginsActivos).map((e) => e.nombre);
        for (const n of ["Inventario", "Informe inventario", "Informe inventario valorado", "Órdenes", "Zonas"]) {
            expect(visibles).toContain(n);
        }
        const remesas = grupo(menu, "Tesorería")!.subelementos.find((e) => e.nombre === "Remesas de pago")!;
        expect(pluginsActivos(remesas)).toBe(true);
    });

    test("sin whoami no se ve Producción (lo decide el servidor)", () => {
        localStorage.removeItem("whoami");
        expect(pluginsActivos(grupo(menu, "Producción") as ElementoMenu)).toBe(false);
    });
});

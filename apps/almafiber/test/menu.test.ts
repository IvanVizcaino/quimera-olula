import { crearMenu, ElementoMenu, MenuContextFactory } from "@olula/lib/menu.ts";
import { describe, expect, test } from "vitest";
import { FactoryAlmafiber } from "../src/factory.ts";
import { RouterFactoryAlmafiber } from "../src/router_factory.ts";

describe("app almafiber", () => {
    const menu = crearMenu(new FactoryAlmafiber() as unknown as Record<string, MenuContextFactory>) as ElementoMenu[];
    const grupos = menu.map((e) => e.nombre);

    test("hereda de olula sólo los módulos de almafiber", () => {
        for (const g of ["Inicio", "Ventas", "Almacén", "Compras", "Contabilidad", "Fiscalidad", "Tesorería",
            "Empresa", "Tablas generales", "Administración", "Asistente IA"]) {
            expect(grupos).toContain(g);
        }
        for (const g of ["CRM", "TPV", "RRHH", "Recursos humanos", "Proyectos", "Predicciones", "Dashboards"]) {
            expect(grupos).not.toContain(g);
        }
    });

    test("tiene las rutas de sus módulos", () => {
        expect(Object.keys(new RouterFactoryAlmafiber())).toEqual([
            "Inicio", "Auth", "Ventas", "Almacen", "Compras", "Contabilidad", "Fiscal", "Tesoreria", "Empresa", "Comun",
        ]);
    });
});

import { crearMenu, ElementoMenu, MenuContextFactory } from "@olula/lib/menu.ts";
import { describe, expect, test } from "vitest";
import { FactoryTecmaq } from "../src/factory.ts";
import { RouterFactoryTecmaq } from "../src/router_factory.ts";

describe("app tecmaq", () => {
    const menu = crearMenu(new FactoryTecmaq() as unknown as Record<string, MenuContextFactory>) as ElementoMenu[];
    const grupos = menu.map((e) => e.nombre);

    test("hereda de olula sólo los módulos de tecmaq", () => {
        for (const g of ["Inicio", "Ventas", "Almacén", "Compras", "Fiscalidad", "Empresa",
            "Tablas generales", "Administración"]) {
            expect(grupos).toContain(g);
        }
        for (const g of ["Contabilidad", "Tesorería", "Asistente IA", "Dashboards", "CRM", "TPV",
            "RRHH", "Recursos humanos", "Proyectos", "Predicciones"]) {
            expect(grupos).not.toContain(g);
        }
    });

    test("tiene las rutas de sus módulos", () => {
        expect(Object.keys(new RouterFactoryTecmaq())).toEqual([
            "Inicio", "Auth", "Ventas", "Almacen", "Compras", "Fiscal", "Empresa", "Comun",
        ]);
    });
});

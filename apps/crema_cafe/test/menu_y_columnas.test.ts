import { metaTablaArticuloBase } from "#/almacen/articulo/maestro/MaestroConDetalleArticulo.tsx";
import { metaTablaArticuloBase as metaTablaArticuloComprasBase } from "#/compras/articulo/maestro/MaestroConDetalleArticulo.tsx";
import { FactoryComprasOlula } from "#/compras/factory.ts";
import { FactoryAlmacenOlula } from "#/almacen/factory.ts";
import { FactoryTpvOlula } from "#/tpv/factory.ts";
import type { TagArticulo } from "#/ventas/articulo/diseño.ts";
import {
    crearMenu,
    type ElementoMenu,
    type ElementoMenuHijo,
    MenuContextFactory,
} from "@olula/lib/menu.ts";
import { cumplePlugin, type RequisitoPlugin } from "@olula/lib/plugins.tsx";
import { crearRouter } from "@olula/lib/router.ts";
import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeEach, describe, expect, test } from "vitest";
import FactoryCremaCafe from "../src/factory.ts";
import { RouterFactoryCremaCafe } from "../src/router_factory.ts";

// Object.groupBy (usado por crearMenu) no existe en Node 20; en navegadores modernos sí.
if (!("groupBy" in Object)) {
    (Object as unknown as { groupBy: unknown }).groupBy = <T>(it: Iterable<T>, f: (x: T) => string) => {
        const r: Record<string, T[]> = {};
        for (const x of it) (r[f(x)] ??= []).push(x);
        return r;
    };
}

const menu = crearMenu(new FactoryCremaCafe() as unknown as Record<string, MenuContextFactory>);
const hijos = (padre: string) =>
    (menu.find((m) => m.nombre === padre) as { subelementos: { nombre: string; url: string }[] }).subelementos;

const hijosMenu = (items: ElementoMenu[]): ElementoMenuHijo[] =>
    items.flatMap((m) => ("subelementos" in m ? m.subelementos : []));

const entradasConPlugin = hijosMenu(menu).filter((h) => h.plugin !== undefined);

const whoami = (plugins: Record<string, string>) =>
    localStorage.setItem("whoami", JSON.stringify({ plugins }));

beforeEach(() => localStorage.clear());

/** Normaliza requisito de menú a clave(es) de plugin para whoami. */
const clavesPlugin = (requisito: RequisitoPlugin): string[] => {
    if (typeof requisito === "string") return [requisito];
    if (Array.isArray(requisito)) return requisito.flatMap(clavesPlugin);
    return [requisito.nombre];
};

describe("crema_cafe: menú (T1.1)", () => {
    test("grupos y entradas", () => {
        expect(menu.map((m) => m.nombre)).toEqual(
            expect.arrayContaining(["Ventas", "Compras", "Almacén", "Tesorería", "TPV", "Contabilidad"])
        );
        expect(hijos("Ventas").map((h) => h.nombre)).toEqual(
            ["Clientes", "Presupuestos", "Pedidos", "Albaranes", "Facturas"]
        );
        expect(hijos("Compras").map((h) => h.nombre)).toEqual([
            "Pedidos",
            "Albaranes",
            "Facturas",
            "Proveedores",
            "Artículos",
        ]);
        expect(hijos("Almacén").map((h) => h.nombre)).toEqual([
            "Artículos",
            "Stock",
            "Inventarios",
            "Inventario valorado",
            "Subfamilias",
            "Unidades de medida",
            "Composiciones",
            "Regenerar movimientos",
        ]);
        expect(hijos("Tesorería").map((h) => h.nombre)).toEqual([
            "Recibos de cobro",
            "Recibos de pago",
            "Remesas de pago",
        ]);
        expect(hijos("Contabilidad").map((h) => h.nombre)).toEqual([
            "Asientos",
            "Plan de cuentas",
            "Cuentas PGC",
            "Recalcular saldos",
            "Libro mayor",
            "Sumas y saldos",
            "Balance",
            "Pérdidas y ganancias",
            "Libro diario",
            "Ingresos y gastos reconocidos",
            "Cambios en el patrimonio neto",
            "Cierre de ejercicio",
            "Modelo 303",
            "Modelo 347",
            "Modelo 349",
            "Modelo 340",
            "Periodos de IVA",
            "Libro IVA emitidas",
            "Libro IVA recibidas",
            "Libro IVA recibidas (RECC)",
        ]);
        expect(hijos("TPV").map((h) => h.nombre)).toEqual([
            "Venta",
            "Arqueo",
            "Agentes",
            "Puntos de venta",
            "Tarjetas de Puntos",
            "Vales",
        ]);
    });

    test("cada entrada del menú tiene ruta", () => {
        const rutas = new Set(crearRouter(new RouterFactoryCremaCafe() as never).map((r) => "/" + r.path));
        const urls = menu.flatMap((m) => ("subelementos" in m ? m.subelementos.map((h) => h.url) : []));
        for (const url of urls) expect(rutas, url).toContain(url);
    });
});

describe("crema_cafe: gating por plugin (I-03 / T0.6)", () => {
    test("entradas de menú condicionadas a plugin", () => {
        expect(entradasConPlugin.map((h) => [h.url, h.plugin])).toEqual(
            expect.arrayContaining([
                ["/almacen/subfamilia", "subfamilias"],
                ["/almacen/pesosmedidas", "pesos_medidas"],
                ["/almacen/composicion", "articulos_compuestos"],
                ["/almacen/regenera_movimientos", "articulos_compuestos"],
                ["/comun/periodo_iva", "cambio_iva"],
                ["/contabilidad/modelo_303", "modelo_303"],
                ["/contabilidad/modelo_347", "modelo_347"],
                ["/contabilidad/modelo_349", "modelo_349"],
                ["/contabilidad/modelo_340", "modelo_340"],
                ["/contabilidad/informe/libro_facturas_recibidas_ccaja", "criterio_caja"],
                ["/tpv/tarjeta_puntos", "puntos_tpv"],
                ["/tpv/vale", "vales_tpv"],
            ])
        );
        expect(entradasConPlugin).toHaveLength(12);
    });

    test("plugin inactivo: cumplePlugin oculta la condición del menú", () => {
        whoami({ puntos_tpv: "inactivo", vales_tpv: "activo" });
        expect(cumplePlugin("puntos_tpv")).toBe(false);
        expect(cumplePlugin("vales_tpv")).toBe(true);
    });

    test("variante activa (trazabilidad): cumplePlugin true", () => {
        whoami({ trazabilidad: "activa" });
        expect(cumplePlugin("trazabilidad")).toBe(true);
    });

    test("cada entrada con plugin tiene ruta y redirige a / si el plugin está apagado", () => {
        const Inicio = () => createElement("span", null, "inicio-plugin-test");
        const rutas = crearRouter(new RouterFactoryCremaCafe() as never);
        const rutasPorPath = new Map(rutas.map((r) => ["/" + r.path, r.Component]));

        for (const entrada of entradasConPlugin) {
            expect(rutasPorPath.has(entrada.url), entrada.url).toBe(true);
            const inactivo = Object.fromEntries(
                clavesPlugin(entrada.plugin!).map((k) => [k, "inactivo"])
            );
            whoami(inactivo);
            const path = entrada.url.replace(/^\//, "");
            const router = createMemoryRouter(
                [
                    { path: "/", Component: Inicio },
                    { path, Component: rutasPorPath.get(entrada.url)! },
                ],
                { initialEntries: [entrada.url] }
            );
            const { unmount } = render(createElement(RouterProvider, { router }));
            expect(screen.getByText("inicio-plugin-test")).toBeInTheDocument();
            unmount();
            localStorage.clear();
        }
    });
});

describe("crema_cafe: orden de columnas CC-02", () => {
    const ordenCremaArticulo = [
        "descripcion",
        "id",
        "grupo_iva_producto_id",
        "descripcion_familia",
        "descripcion_subfamilia",
        "uso",
    ];

    test("maestro de artículos: descripción antes que referencia; base intacta", () => {
        const crema = new FactoryCremaCafe().Almacen.articulo_metaTabla.map((c) => c.id);
        expect(crema).toEqual(ordenCremaArticulo);
        expect(FactoryAlmacenOlula.articulo_metaTabla).toBe(metaTablaArticuloBase);
        expect(metaTablaArticuloBase.map((c) => c.id).slice(0, 2)).toEqual(["id", "descripcion"]);
    });

    test("compras/artículos: mismo orden Crema que almacén; base compras intacta", () => {
        const almacen = new FactoryCremaCafe().Almacen.articulo_metaTabla.map((c) => c.id);
        const compras = new FactoryCremaCafe().Compras.articulo_metaTabla.map((c) => c.id);
        expect(compras).toEqual(almacen);
        expect(FactoryComprasOlula.articulo_metaTabla).toBe(metaTablaArticuloComprasBase);
        expect(metaTablaArticuloComprasBase.map((c) => c.id).slice(0, 2)).toEqual(["id", "descripcion"]);
    });

    test("buscador TPV: descripción - referencia; la base no define formato", () => {
        const a = { id: "A1", descripcion: "Café" } as TagArticulo;
        expect(new FactoryCremaCafe().TPV.articulo_formatoOpcion(a)).toBe("Café - A1");
        expect((FactoryTpvOlula as unknown as Record<string, unknown>).articulo_formatoOpcion).toBeUndefined();
    });
});

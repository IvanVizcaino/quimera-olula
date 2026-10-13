import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeEach, describe, expect, test } from "vitest";
import { cumplePlugin, estadoPluginActivo, pluginActivo, slotConPlugin } from "../plugins.tsx";
import { crearRouter } from "../router.ts";

const whoami = (plugins: Record<string, unknown>) =>
    localStorage.setItem("whoami", JSON.stringify({ plugins }));

beforeEach(() => localStorage.clear());

describe("estadoPluginActivo", () => {
    test.each([
        ["activo", true], ["Activo", true], ["activa", true], ["firma", true], ["basico", true], ["base", true], ["plaid", true],
        ["inactivo", false], ["INACTIVO", false], ["inactiva", false], ["ninguna", false], ["NoConfigurado", false],
        ["legacy", false], ["", false], ["  ", false], [null, false], [undefined, false], [3, false],
    ])("%s -> %s", (estado, esperado) => {
        expect(estadoPluginActivo(estado)).toBe(esperado);
    });
});

describe("pluginActivo", () => {
    test("sin whoami o plugin ausente es false", () => {
        expect(pluginActivo("x")).toBe(false);
        whoami({ otro: "activo" });
        expect(pluginActivo("x")).toBe(false);
    });
    test("null en el backend es false", () => {
        whoami({ x: null });
        expect(pluginActivo("x")).toBe(false);
    });
    test("con variantes solo cuentan esas", () => {
        whoami({ e: "basico" });
        expect(pluginActivo("e")).toBe(true);
        expect(pluginActivo("e", "firma")).toBe(false);
        whoami({ e: "firma" });
        expect(pluginActivo("e", ["firma", "activo"])).toBe(true);
    });
});

describe("cumplePlugin", () => {
    test("sin requisito siempre se cumple", () => {
        expect(cumplePlugin(undefined)).toBe(true);
    });
    test("lista exige todos, objeto exige variante", () => {
        whoami({ a: "activo", b: "inactivo", c: "firma" });
        expect(cumplePlugin(["a", "c"])).toBe(true);
        expect(cumplePlugin(["a", "b"])).toBe(false);
        expect(cumplePlugin({ nombre: "c", variante: "firma" })).toBe(true);
        expect(cumplePlugin({ nombre: "c", variante: "otra" })).toBe(false);
    });
});

describe("slotConPlugin", () => {
    const Con = () => <span>con</span>;
    const Sin = () => <span>sin</span>;
    test("elige según el plugin", () => {
        whoami({ p: "activo" });
        const Slot = slotConPlugin("p", Con, Sin);
        const { unmount } = render(<Slot />);
        expect(screen.getByText("con")).toBeInTheDocument();
        unmount();
        whoami({ p: "inactivo" });
        render(<Slot />);
        expect(screen.getByText("sin")).toBeInTheDocument();
    });
    test("sin Inactivo no pinta nada", () => {
        const Slot = slotConPlugin("p", Con);
        const { container } = render(<Slot />);
        expect(container).toBeEmptyDOMElement();
    });
});

describe("crearRouter con plugins", () => {
    const Libre = () => <span>libre</span>;
    const Protegida = () => <span>protegida</span>;
    const montar = (ruta: string) => {
        const rutas = crearRouter({
            a: { router: { "/": Libre, "/prot": Protegida } as never, plugins: { "/prot": "p" } },
        });
        render(<RouterProvider router={createMemoryRouter(rutas, { initialEntries: [ruta] })} />);
    };
    test("plugin inactivo: la ruta redirige", () => {
        whoami({ p: "inactivo" });
        montar("/prot");
        expect(screen.queryByText("protegida")).not.toBeInTheDocument();
        expect(screen.getByText("libre")).toBeInTheDocument();
    });
    test("plugin activo: la ruta es accesible", () => {
        whoami({ p: "activo" });
        montar("/prot");
        expect(screen.getByText("protegida")).toBeInTheDocument();
    });
    test("ruta sin plugin se registra igual que antes", () => {
        const rutas = crearRouter({ a: { router: { "/": Libre } as never } });
        expect(rutas).toEqual([{ path: "/", Component: Libre }]);
    });
});

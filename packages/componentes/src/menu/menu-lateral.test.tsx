import { FactoryCtx } from "@olula/lib/factory_ctx.tsx";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, expect, test } from "vitest";
import { MenuProvider } from "../plantilla/MenuContext.tsx";
import { Home } from "../home/Home.tsx";
import { MenuLateral } from "./menu-lateral.tsx";

const whoami = (plugins: Record<string, string>) =>
    localStorage.setItem("whoami", JSON.stringify({ plugins }));
beforeEach(() => localStorage.clear());

const ctx = (menu: unknown[], widgets: unknown[] = []) =>
    ({ menu, widgets }) as never;

const menu = [
    { nombre: "Libre", url: "/libre" },
    { nombre: "Lotes", url: "/lotes", plugin: "trazabilidad" },
    { nombre: "Grupo", plugin: "trazabilidad", subelementos: [{ nombre: "Hijo", url: "/h" }] },
];

const pintarMenu = () =>
    render(
        <MemoryRouter>
            <FactoryCtx.Provider value={ctx(menu)}>
                <MenuProvider>
                    <MenuLateral />
                </MenuProvider>
            </FactoryCtx.Provider>
        </MemoryRouter>
    );

test("menu: plugin inactivo oculta entradas con plugin y no las demas", () => {
    whoami({ trazabilidad: "inactiva" });
    pintarMenu();
    expect(screen.getByText("Libre")).toBeInTheDocument();
    expect(screen.queryByText("Lotes")).not.toBeInTheDocument();
    expect(screen.queryByText("Grupo")).not.toBeInTheDocument();
});

test("menu: plugin activo muestra las entradas", () => {
    whoami({ trazabilidad: "activa" });
    pintarMenu();
    expect(screen.getByText("Lotes")).toBeInTheDocument();
    expect(screen.getByText("Grupo")).toBeInTheDocument();
});

test("home: filtra widgets por plugin", () => {
    whoami({ p: "inactivo" });
    const widgets = [
        { id: "a", Componente: () => <span>wa</span> },
        { id: "b", plugin: "p", Componente: () => <span>wb</span> },
    ];
    render(
        <FactoryCtx.Provider value={ctx([], widgets)}>
            <Home />
        </FactoryCtx.Provider>
    );
    expect(screen.getByText("wa")).toBeInTheDocument();
    expect(screen.queryByText("wb")).not.toBeInTheDocument();
});

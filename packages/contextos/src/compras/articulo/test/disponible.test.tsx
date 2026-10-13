import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, test, vi } from "vitest";

const getArticulos = vi.fn();

vi.mock("../infraestructura.ts", async (original) => ({
    ...(await original<typeof import("../infraestructura.ts")>()),
    getArticulos: (...a: unknown[]) => getArticulos(...a),
    getArticulo: vi.fn(),
}));

vi.mock("#/almacen/comun/componentes/Familia.tsx", () => ({ Familia: () => null }));

const { articuloDesdeApi } = await import("../infraestructura.ts");
const { MaestroConDetalleArticulo } = await import("../maestro/MaestroConDetalleArticulo.tsx");

const api = (extra: Record<string, unknown> = {}) =>
    ({
        id: "CAFE1",
        descripcion: "Café molido",
        observaciones: null,
        familia_id: null,
        descripcion_familia: "Cafés",
        grupo_iva_producto_id: null,
        sin_stock: false,
        se_compra: true,
        ...extra,
    }) as Parameters<typeof articuloDesdeApi>[0];

const whoami = (plugins: Record<string, string>) =>
    localStorage.setItem(
        "whoami",
        JSON.stringify({ plugins, permisos: [{ id_regla: "general", valor: true }] }),
    );

describe("Compras/Artículos: columna Disponible (plugin disponible_art)", () => {
    beforeEach(() => {
        getArticulos.mockReset();
        HTMLDialogElement.prototype.showModal = vi.fn();
        HTMLDialogElement.prototype.close = vi.fn();
    });

    test("articuloDesdeApi mapea total_disponible (ausente = undefined)", () => {
        expect(articuloDesdeApi(api({ total_disponible: 12.5 })).totalDisponible).toBe(12.5);
        expect(articuloDesdeApi(api()).totalDisponible).toBeUndefined();
    });

    test("con plugin activo y dato en la API aparece la columna con el valor", async () => {
        whoami({ disponible_art: "activa" });
        getArticulos.mockResolvedValue({ datos: [articuloDesdeApi(api({ total_disponible: 7 }))], total: 1 });
        render(
            <MemoryRouter>
                <MaestroConDetalleArticulo />
            </MemoryRouter>,
        );
        expect(await screen.findByText("Café molido")).toBeInTheDocument();
        expect(screen.getByText("Disponible")).toBeInTheDocument();
        expect(screen.getByText("7")).toBeInTheDocument();
    });

    test("con plugin inactivo no aparece", async () => {
        whoami({ disponible_art: "inactiva" });
        getArticulos.mockResolvedValue({ datos: [articuloDesdeApi(api({ total_disponible: 7 }))], total: 1 });
        render(
            <MemoryRouter>
                <MaestroConDetalleArticulo />
            </MemoryRouter>,
        );
        await screen.findByText("Café molido");
        expect(screen.queryByText("Disponible")).not.toBeInTheDocument();
    });

    test("con plugin activo pero la API compras sin el dato no se muestra una columna vacía", async () => {
        whoami({ disponible_art: "activa" });
        getArticulos.mockResolvedValue({ datos: [articuloDesdeApi(api())], total: 1 });
        render(
            <MemoryRouter>
                <MaestroConDetalleArticulo />
            </MemoryRouter>,
        );
        await screen.findByText("Café molido");
        expect(screen.queryByText("Disponible")).not.toBeInTheDocument();
    });
});

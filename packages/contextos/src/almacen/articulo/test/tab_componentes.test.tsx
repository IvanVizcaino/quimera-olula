import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

const getComposicionArticuloKit = vi.fn();
const patchComposicionArticuloKit = vi.fn();

vi.mock("#/almacen/articulo_compuesto/infraestructura.ts", () => ({
    getComposicionArticuloKit: (...a: unknown[]) => getComposicionArticuloKit(...a),
    patchComposicionArticuloKit: (...a: unknown[]) => patchComposicionArticuloKit(...a),
}));

const { TabComponentes, MENSAJE_STOCK_POR_COMPONENTES } = await import("../detalle/componentes/TabComponentes.tsx");

const kit = (stockPorComponentes: boolean) => ({
    articuloId: "KIT",
    stockPorComponentes,
    componentes: [],
});

const casilla = () =>
    document.querySelector('quimera-checkbox[nombre="stock_por_componentes"] input') as HTMLInputElement;

describe("TabComponentes: Control stock componentes (Eneboo stockcomp)", () => {
    beforeEach(() => {
        getComposicionArticuloKit.mockReset();
        patchComposicionArticuloKit.mockReset().mockResolvedValue(undefined);
        localStorage.setItem(
            "whoami",
            JSON.stringify({ plugins: {}, permisos: [{ id_regla: "general", valor: true }] }),
        );
        HTMLDialogElement.prototype.showModal = vi.fn();
        HTMLDialogElement.prototype.close = vi.fn();
    });

    test("el texto de confirmación es el literal de Eneboo", () => {
        expect(MENSAJE_STOCK_POR_COMPONENTES).toBe(
            "Esta acción no es reversible. No podrá guardar si el artículo no tiene componentes o ya tiene movimientos de stock asociados. ¿Desea continuar?",
        );
    });

    test("ya activo: el campo queda deshabilitado", async () => {
        getComposicionArticuloKit.mockResolvedValue(kit(true));
        render(<TabComponentes articuloId="KIT" />);
        await screen.findByText("Sin componentes definidos.");
        expect(casilla().checked).toBe(true);
        expect(casilla().disabled).toBe(true);
    });

    test("al marcar pide confirmación; al aceptar se envía stock_por_componentes en el guardado", async () => {
        getComposicionArticuloKit.mockResolvedValue(kit(false));
        render(<TabComponentes articuloId="KIT" />);
        await screen.findByText("Sin componentes definidos.");
        expect(casilla().disabled).toBe(false);

        await userEvent.click(casilla());
        expect(await screen.findByText(MENSAJE_STOCK_POR_COMPONENTES)).toBeInTheDocument();
        await userEvent.click(screen.getByText("Sí"));
        expect(casilla().checked).toBe(true);

        await userEvent.click(screen.getByText("Guardar componentes"));
        expect(patchComposicionArticuloKit).toHaveBeenCalledWith("KIT", [], true);
    });

    test("responder No no activa el campo", async () => {
        getComposicionArticuloKit.mockResolvedValue(kit(false));
        render(<TabComponentes articuloId="KIT" />);
        await screen.findByText("Sin componentes definidos.");
        await userEvent.click(casilla());
        await userEvent.click(await screen.findByText("No"));
        expect(casilla().checked).toBe(false);
        await userEvent.click(screen.getByText("Guardar componentes"));
        expect(patchComposicionArticuloKit).toHaveBeenCalledWith("KIT", [], false);
    });
});

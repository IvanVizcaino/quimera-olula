import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import {
    MENSAJE_ALMACEN_NO_EXISTE,
    MENSAJE_CONFIRMAR_REGENERACION,
    MENSAJE_SIN_FILTRO,
} from "../dominio.ts";

const postRegenerarMovimientos = vi.fn();

vi.mock("../infraestructura.ts", () => ({
    postRegenerarMovimientos: (...a: unknown[]) => postRegenerarMovimientos(...a),
}));

type OnChange = (o: { valor: string; descripcion: string } | null) => void;
const selector = (prefijo: string, valor: string) =>
    ({ nombre, onChange }: { nombre: string; onChange?: OnChange }) => (
        <button data-testid={`${prefijo}-${nombre}`} onClick={() => onChange?.({ valor, descripcion: valor })}>
            {nombre}
        </button>
    );

vi.mock("#/almacen/comun/componentes/Almacen.tsx", () => ({ Almacen: selector("sel", "ALG") }));
vi.mock("#/almacen/comun/componentes/Familia.tsx", () => ({ Familia: selector("sel", "FAM1") }));
vi.mock("#/almacen/comun/componentes/Articulo.tsx", () => ({ Articulo: selector("sel", "ART1") }));

const { RegenerarMovimientos } = await import("../vistas/RegenerarMovimientos.tsx");

describe("RegenerarMovimientos (proceso acRegeneraMovimientos)", () => {
    beforeEach(() => {
        postRegenerarMovimientos.mockReset().mockResolvedValue({
            articulos: 1,
            lineas: 7,
            stocksRevisados: 3,
            porDocumento: { pedidoscli: 4, albaranescli: 3 },
        });
        HTMLDialogElement.prototype.showModal = vi.fn();
        HTMLDialogElement.prototype.close = vi.fn();
    });

    test("sin almacén muestra el literal de Eneboo y no llama a la API", async () => {
        render(<RegenerarMovimientos />);
        await userEvent.click(screen.getByText("Regenerar movimientos", { selector: "button *, button" }));
        expect(await screen.findByText(MENSAJE_ALMACEN_NO_EXISTE)).toBeInTheDocument();
        expect(postRegenerarMovimientos).not.toHaveBeenCalled();
    });

    test("con almacén pero sin filtro pide indicar un filtro", async () => {
        render(<RegenerarMovimientos />);
        await userEvent.click(screen.getByTestId("sel-almacen_id"));
        await userEvent.click(screen.getByText("Regenerar movimientos", { selector: "button *, button" }));
        expect(await screen.findByText(MENSAJE_SIN_FILTRO)).toBeInTheDocument();
        expect(postRegenerarMovimientos).not.toHaveBeenCalled();
    });

    test("almacén + artículo: confirma, ejecuta y muestra el resumen", async () => {
        render(<RegenerarMovimientos />);
        await userEvent.click(screen.getByTestId("sel-almacen_id"));
        await userEvent.click(screen.getByTestId("sel-articulo_nuevo"));
        expect(screen.getByText("ART1")).toBeInTheDocument();

        await userEvent.click(screen.getByText("Regenerar movimientos", { selector: "button *, button" }));
        expect(await screen.findByText(MENSAJE_CONFIRMAR_REGENERACION)).toBeInTheDocument();
        expect(postRegenerarMovimientos).not.toHaveBeenCalled();
        await userEvent.click(screen.getByText("Aceptar"));

        await waitFor(() => expect(postRegenerarMovimientos).toHaveBeenCalledTimes(1));
        expect(postRegenerarMovimientos).toHaveBeenCalledWith({ almacenId: "ALG", articulos: ["ART1"] });
        expect(await screen.findByText("Resultado")).toBeInTheDocument();
        expect(screen.getByText("pedidoscli: 4")).toBeInTheDocument();
    });

    test("un artículo no se añade dos veces y se puede quitar", async () => {
        render(<RegenerarMovimientos />);
        await userEvent.click(screen.getByTestId("sel-articulo_nuevo"));
        await userEvent.click(screen.getByTestId("sel-articulo_nuevo"));
        expect(screen.getAllByText("ART1")).toHaveLength(1);
        await userEvent.click(screen.getByText("Quitar"));
        expect(screen.queryByText("ART1")).not.toBeInTheDocument();
    });
});

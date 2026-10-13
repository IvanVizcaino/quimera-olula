import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { patch } = vi.hoisted(() => ({ patch: vi.fn() }));

vi.mock("@olula/lib/api/rest_api.ts", () => ({
    RestAPI: { patch },
}));

const { patchRecalcularSaldosSubcuentas, resultadoRecalculoSaldosDesdeApi } = await import(
    "../infraestructura.ts"
);
const { mensajeRecalculoSaldos } = await import("../dominio.ts");
const { RecalcularSaldosSubcuentas } = await import(
    "../recalcular_saldos/RecalcularSaldosSubcuentas.tsx"
);

const respuestaApi = {
    ejercicios: ["2026"],
    revisadas: 1511,
    corregidas: [
        {
            id: 7,
            codigo: "4300000001",
            ejercicio_id: "2026",
            debe_antes: 10,
            haber_antes: 0,
            debe: 12,
            haber: 2,
            saldo: 10,
        },
    ],
};

describe("recalcular saldos de subcuentas: infraestructura y dominio", () => {
    beforeEach(() => patch.mockReset());

    test("sin ejercicio envía cuerpo vacío (todos los ejercicios abiertos)", async () => {
        patch.mockResolvedValue(respuestaApi);
        const r = await patchRecalcularSaldosSubcuentas();
        expect(patch).toHaveBeenCalledWith(
            expect.stringMatching(/\/contabilidad\/subcuenta\/recalcular_saldos$/),
            {},
            expect.any(String),
        );
        expect(r.revisadas).toBe(1511);
        expect(r.corregidas[0]).toEqual({
            id: 7,
            codigo: "4300000001",
            ejercicioId: "2026",
            debeAntes: 10,
            haberAntes: 0,
            debe: 12,
            haber: 2,
            saldo: 10,
        });
    });

    test("con ejercicio lo envía como ejercicio_id", async () => {
        patch.mockResolvedValue({ datos: respuestaApi });
        await patchRecalcularSaldosSubcuentas("2026");
        expect(patch.mock.calls[0][1]).toEqual({ ejercicio_id: "2026" });
    });

    test("mensaje final como el de Eneboo", () => {
        const r = resultadoRecalculoSaldosDesdeApi(respuestaApi);
        expect(mensajeRecalculoSaldos(r)).toBe(
            "Proceso finalizado. Subcuentas actualizadas: 1511 (1 con saldo corregido).",
        );
    });
});

describe("RecalcularSaldosSubcuentas (vista)", () => {
    beforeEach(() => {
        patch.mockReset().mockResolvedValue(respuestaApi);
        HTMLDialogElement.prototype.showModal = vi.fn();
        HTMLDialogElement.prototype.close = vi.fn();
    });

    test("pide confirmación y no llama a la API hasta aceptar; luego muestra el resultado", async () => {
        render(<RecalcularSaldosSubcuentas />);
        await userEvent.click(screen.getByText("Recalcular saldos", { selector: "button" }));

        const aviso = await screen.findByText(/de todos los ejercicios abiertos/);
        expect(patch).not.toHaveBeenCalled();
        await userEvent.click(within(aviso.closest("dialog")!).getByText("Aceptar"));

        await waitFor(() => expect(patch).toHaveBeenCalledTimes(1));
        expect(await screen.findByRole("status")).toHaveTextContent(
            "Proceso finalizado. Subcuentas actualizadas: 1511 (1 con saldo corregido).",
        );
        expect(screen.getByText("4300000001")).toBeInTheDocument();
    });

    test("con ejercicio informado lo menciona y lo envía", async () => {
        render(<RecalcularSaldosSubcuentas />);
        await userEvent.type(
            document.querySelector('quimera-input[nombre="ejercicio_id"] input') as HTMLInputElement,
            "2025",
        );
        await userEvent.click(screen.getByText("Recalcular saldos", { selector: "button" }));
        const aviso = await screen.findByText(/del ejercicio 2025/);
        await userEvent.click(within(aviso.closest("dialog")!).getByText("Aceptar"));
        await waitFor(() => expect(patch.mock.calls[0][1]).toEqual({ ejercicio_id: "2025" }));
    });
});

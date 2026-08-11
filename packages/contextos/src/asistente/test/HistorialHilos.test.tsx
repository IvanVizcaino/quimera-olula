import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { test, expect, vi, beforeEach } from "vitest";
import { HistorialHilos } from "#/asistente/vistas/HistorialHilos.tsx";
import { borrarHilo, listarHilos } from "#/asistente/infraestructura.ts";

const hilos = [
    { threadId: "hilo-1", titulo: "Presupuesto para Acme", actualizadoEn: "2026-01-01T00:00:00+00:00" },
    { threadId: "hilo-2", titulo: "Consulta de stock", actualizadoEn: "2026-01-02T00:00:00+00:00" },
];

vi.mock("#/asistente/infraestructura.ts", () => ({
    listarHilos: vi.fn(async () => []),
    borrarHilo: vi.fn(async () => {}),
}));

beforeEach(() => {
    vi.mocked(listarHilos).mockReset().mockResolvedValue(hilos);
    vi.mocked(borrarHilo).mockReset().mockResolvedValue(undefined);
});

test("[asistente-historial-01] pide confirmación antes de borrar y no llama a la API si se cancela", async () => {
    const onHiloActivoBorrado = vi.fn();
    render(<HistorialHilos threadIdActivo={null} onSeleccionar={vi.fn()} onHiloActivoBorrado={onHiloActivoBorrado} />);

    const botones = await screen.findAllByRole("button", { name: "Borrar conversación" });
    await userEvent.click(botones[0]);
    await screen.findByText(/Seguro que quieres borrar "Presupuesto para Acme"/);

    // El contenido del modal de confirmación queda dentro de un <dialog> que en jsdom
    // nunca llega a marcarse "open" (showModal está mockeado como no-op en
    // setupTests.ts) — dom-accessibility-api lo trata como inaccesible, así que aquí
    // hay que consultar por texto en vez de por rol, igual que el resto de tests que
    // interactúan con QModal/QModalConfirmacion en este monorepo.
    await userEvent.click(screen.getByText("Cancelar"));

    expect(borrarHilo).not.toHaveBeenCalled();
    expect(await screen.findByText("Presupuesto para Acme")).toBeInTheDocument();
});

test("[asistente-historial-02] al confirmar, borra el hilo y lo quita de la lista", async () => {
    const onHiloActivoBorrado = vi.fn();
    render(<HistorialHilos threadIdActivo={null} onSeleccionar={vi.fn()} onHiloActivoBorrado={onHiloActivoBorrado} />);

    const botones = await screen.findAllByRole("button", { name: "Borrar conversación" });
    await userEvent.click(botones[0]);
    await userEvent.click(await screen.findByText("Borrar"));

    await waitFor(() => expect(borrarHilo).toHaveBeenCalledWith("hilo-1"));
    await waitFor(() => expect(screen.queryByText("Presupuesto para Acme")).not.toBeInTheDocument());
    expect(screen.getByText("Consulta de stock")).toBeInTheDocument();
    expect(onHiloActivoBorrado).not.toHaveBeenCalled();
});

test("[asistente-historial-03] si el hilo borrado era el activo, avisa al padre para que empiece una conversación nueva", async () => {
    const onHiloActivoBorrado = vi.fn();
    render(<HistorialHilos threadIdActivo="hilo-1" onSeleccionar={vi.fn()} onHiloActivoBorrado={onHiloActivoBorrado} />);

    const botones = await screen.findAllByRole("button", { name: "Borrar conversación" });
    await userEvent.click(botones[0]);
    await userEvent.click(await screen.findByText("Borrar"));

    await waitFor(() => expect(onHiloActivoBorrado).toHaveBeenCalledTimes(1));
});

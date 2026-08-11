import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { test, expect, vi, beforeEach } from "vitest";
import { AsistenteRuntimeProvider } from "#/asistente/vistas/AsistenteRuntimeProvider.tsx";
import { Chat } from "#/asistente/vistas/Chat.tsx";
import { consultarIa, obtenerAdjuntoHilo, obtenerMensajesHilo } from "#/asistente/infraestructura.ts";

const respuestaSimple = {
    respuesta: "Recibido.",
    threadId: "hilo-1",
    a2uiMessages: [],
    capacidadesHash: null,
    necesitaCapacidades: false,
    accionNavegacion: null,
    adjuntos: [{ id: "adj-1", nombre: "pedido.xlsx", tipoMime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }],
};

vi.mock("#/asistente/infraestructura.ts", () => ({
    consultarIa: vi.fn(async () => respuestaSimple),
    consultarIaStream: vi.fn(),
    listarHilos: vi.fn(async () => []),
    obtenerMensajesHilo: vi.fn(async () => ({ threadId: "hilo-1", mensajes: [] })),
    obtenerAdjuntoHilo: vi.fn(async () => new Blob(["contenido-audio"], { type: "audio/mp3" })),
}));

beforeEach(() => {
    localStorage.clear();
    globalThis.ResizeObserver ??= class {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
    Element.prototype.scrollTo ??= () => {};
    URL.createObjectURL ??= () => "blob:mock-url";
    vi.mocked(consultarIa).mockClear();
});

test("[asistente-chat-adjunto-01] adjuntar un Excel muestra el chip y lo manda en la consulta", async () => {
    render(
        <AsistenteRuntimeProvider>
            <Chat />
        </AsistenteRuntimeProvider>
    );

    const archivo = new File(["contenido-excel"], "pedido.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const input = document.querySelector(".asistente-chat__input-archivo") as HTMLInputElement;
    await userEvent.upload(input, archivo);

    // El chip del adjunto pendiente aparece antes de enviar
    await screen.findByText("pedido.xlsx");

    await userEvent.type(await screen.findByPlaceholderText("Escribe un mensaje…"), "crea el pedido");
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect(consultarIa).toHaveBeenCalledTimes(1);
    const consultaEnviada = vi.mocked(consultarIa).mock.calls[0][0];
    expect(consultaEnviada.pregunta).toBe("crea el pedido");
    expect(consultaEnviada.adjuntos).toEqual([{
        nombre: "pedido.xlsx",
        tipoMime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        datosBase64: expect.any(String),
    }]);
});

test("[asistente-chat-adjunto-02] un adjunto de audio reconstruido se reproduce bajo demanda", async () => {
    localStorage.setItem("quimera-preferencias", JSON.stringify({ "asistente.threadIdActivo": "hilo-viejo" }));
    vi.mocked(obtenerMensajesHilo).mockResolvedValueOnce({
        threadId: "hilo-viejo",
        mensajes: [
            {
                id: "m1-u", rol: "user", texto: "", a2uiMessages: [],
                adjuntos: [{ id: "adj-audio-1", nombre: "nota-de-voz.mp3", tipoMime: "audio/mp3" }],
            },
            { id: "m1-a", rol: "assistant", texto: "Te he entendido.", a2uiMessages: [], adjuntos: [] },
        ],
    });

    const { container } = render(
        <AsistenteRuntimeProvider>
            <Chat />
        </AsistenteRuntimeProvider>
    );

    const botonReproducir = await screen.findByRole("button", { name: "Reproducir nota de voz" });
    await userEvent.click(botonReproducir);

    expect(obtenerAdjuntoHilo).toHaveBeenCalledWith("hilo-viejo", "adj-audio-1");
    // Tras cargar el blob, se sustituye el botón por un reproductor de audio real
    await waitFor(() => expect(container.querySelector("audio")).not.toBeNull());
});

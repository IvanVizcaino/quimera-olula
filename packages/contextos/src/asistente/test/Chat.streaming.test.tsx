import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { test, expect, vi, beforeEach } from "vitest";
import { AsistenteRuntimeProvider, useAsistenteContext } from "#/asistente/vistas/AsistenteRuntimeProvider.tsx";
import { Chat } from "#/asistente/vistas/Chat.tsx";
import { consultarIaStream } from "#/asistente/infraestructura.ts";
import type { EventoStreamIa } from "#/asistente/diseño.ts";

vi.mock("#/asistente/infraestructura.ts", () => ({
    consultarIa: vi.fn(),
    consultarIaStream: vi.fn(),
    listarHilos: vi.fn(async () => []),
    obtenerMensajesHilo: vi.fn(async () => ({ threadId: "hilo-1", mensajes: [] })),
    obtenerAdjuntoHilo: vi.fn(),
}));

const streamDe = (eventos: EventoStreamIa[]) =>
    (async function* () {
        for (const evento of eventos) yield evento;
    })();

const esperar = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Con "streamDe" todos los eventos llegan en el mismo tick — insuficiente para
// comprobar que un "estado" transitorio realmente se ve antes de ser sustituido.
const streamDeConPausas = (eventos: EventoStreamIa[]) =>
    (async function* () {
        for (const evento of eventos) {
            await esperar(10);
            yield evento;
        }
    })();

beforeEach(() => {
    localStorage.clear();
    globalThis.ResizeObserver ??= class {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
    Element.prototype.scrollTo ??= () => {};
    vi.mocked(consultarIaStream).mockReset();
});

test("[asistente-chat-stream-01] los deltas de streaming se acumulan en el mensaje del asistente", async () => {
    vi.mocked(consultarIaStream).mockReturnValue(streamDe([
        { tipo: "delta", contenido: "Hola" },
        { tipo: "delta", contenido: ", mundo" },
        { tipo: "fin", threadId: "hilo-1", necesitaCapacidades: false, adjuntos: [] },
    ]));

    render(
        <AsistenteRuntimeProvider>
            <Chat />
        </AsistenteRuntimeProvider>
    );

    // El modo estándar es el default — se activa streaming explícitamente.
    await userEvent.click(screen.getByRole("button", { name: "Estándar" }));

    await userEvent.type(await screen.findByPlaceholderText("Escribe un mensaje…"), "hola");
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));

    await screen.findByText("Hola, mundo");
});

test("[asistente-chat-stream-02] necesita_capacidades reintenta automáticamente con capacidades completas", async () => {
    vi.mocked(consultarIaStream)
        .mockReturnValueOnce(streamDe([
            { tipo: "fin", threadId: "hilo-1", necesitaCapacidades: true, adjuntos: [] },
        ]))
        .mockReturnValueOnce(streamDe([
            { tipo: "delta", contenido: "Respuesta tras reintentar" },
            { tipo: "fin", threadId: "hilo-1", necesitaCapacidades: false, adjuntos: [] },
        ]));

    render(
        <AsistenteRuntimeProvider>
            <Chat />
        </AsistenteRuntimeProvider>
    );

    await userEvent.click(screen.getByRole("button", { name: "Estándar" }));

    await userEvent.type(await screen.findByPlaceholderText("Escribe un mensaje…"), "hola");
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));

    await screen.findByText("Respuesta tras reintentar");
    expect(consultarIaStream).toHaveBeenCalledTimes(2);
});

test("[asistente-chat-stream-04] un evento estado se muestra y se sustituye por el primer delta real", async () => {
    vi.mocked(consultarIaStream).mockReturnValue(streamDeConPausas([
        { tipo: "estado", contenido: "Buscando el cliente…" },
        { tipo: "delta", contenido: "Aquí tienes el cliente." },
        { tipo: "fin", threadId: "hilo-1", necesitaCapacidades: false, adjuntos: [] },
    ]));

    render(
        <AsistenteRuntimeProvider>
            <Chat />
        </AsistenteRuntimeProvider>
    );

    await userEvent.click(screen.getByRole("button", { name: "Estándar" }));

    await userEvent.type(await screen.findByPlaceholderText("Escribe un mensaje…"), "busca el cliente");
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));

    await screen.findByText("Buscando el cliente…");
    await screen.findByText("Aquí tienes el cliente.");
    expect(screen.queryByText("Buscando el cliente…")).toBeNull();
});

function Probe() {
    const { enviarMensaje, adjuntosPorMensaje, setStreamingEnabled } = useAsistenteContext();
    return (
        <div>
            <button type="button" onClick={() => setStreamingEnabled(true)}>activar-streaming</button>
            <button
                type="button"
                onClick={() => enviarMensaje("crea el pedido", [
                    { nombre: "pedido.xlsx", tipoMime: "application/vnd.ms-excel", datosBase64: "QUJD" },
                ])}
            >
                enviar-con-adjunto
            </button>
            <pre data-testid="adjuntos">{JSON.stringify(adjuntosPorMensaje)}</pre>
        </div>
    );
}

test("[asistente-chat-stream-05] el id de adjunto devuelto en fin se aplica al mensaje de usuario", async () => {
    vi.mocked(consultarIaStream).mockReturnValue(streamDe([
        { tipo: "delta", contenido: "Recibido." },
        {
            tipo: "fin", threadId: "hilo-1", necesitaCapacidades: false,
            adjuntos: [{ id: "adj-1", nombre: "pedido.xlsx", tipoMime: "application/vnd.ms-excel" }],
        },
    ]));

    render(
        <AsistenteRuntimeProvider>
            <Probe />
        </AsistenteRuntimeProvider>
    );

    await userEvent.click(screen.getByRole("button", { name: "activar-streaming" }));
    await userEvent.click(screen.getByRole("button", { name: "enviar-con-adjunto" }));

    await screen.findByText(/"id":"adj-1"/);
});

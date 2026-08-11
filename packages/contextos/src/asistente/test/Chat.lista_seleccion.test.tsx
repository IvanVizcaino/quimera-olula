import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { test, expect, vi, beforeEach } from "vitest";
import { AsistenteRuntimeProvider } from "#/asistente/vistas/AsistenteRuntimeProvider.tsx";
import { Chat } from "#/asistente/vistas/Chat.tsx";
import { enviarAccionA2ui } from "#/asistente/infraestructura.ts";

const respuestaConListaSeleccion = {
    respuesta: "He encontrado varios artículos. ¿Cuál es?",
    threadId: "hilo-1",
    a2uiMessages: [
        {
            version: "v0.9",
            createSurface: {
                surfaceId: "hilo-1",
                catalogId: "https://a2ui.org/specification/v0_9/basic_catalog.json",
            },
        },
        {
            version: "v0.9",
            updateComponents: {
                surfaceId: "hilo-1",
                components: [
                    {
                        id: "root",
                        component: "ListaSeleccion",
                        titulo: "He encontrado varios artículos. ¿Cuál es?",
                        multiple: true,
                        opciones: [
                            { id: "A1", etiqueta: "Manzana Golden (ID: A1)", valor: "El artículo es Manzana Golden (id: A1)" },
                            { id: "A2", etiqueta: "Manzana Fuji (ID: A2)", valor: "El artículo es Manzana Fuji (id: A2)" },
                        ],
                    },
                ],
            },
        },
    ],
    capacidadesHash: null,
    necesitaCapacidades: false,
    accionNavegacion: null,
};

vi.mock("#/asistente/infraestructura.ts", () => ({
    consultarIa: vi.fn(async () => respuestaConListaSeleccion),
    consultarIaStream: vi.fn(),
    enviarAccionA2ui: vi.fn(async () => ({
        respuesta: "De acuerdo.",
        threadId: "hilo-1",
        a2uiMessages: [],
        capacidadesHash: null,
        necesitaCapacidades: false,
        accionNavegacion: null,
    })),
    listarHilos: vi.fn(async () => []),
    obtenerMensajesHilo: vi.fn(async () => ({ threadId: "hilo-1", mensajes: [] })),
}));

beforeEach(() => {
    localStorage.clear();
    globalThis.ResizeObserver ??= class {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
    Element.prototype.scrollTo ??= () => {};
});

test("[asistente-seleccion-01] marcar varias opciones y pulsar Enviar manda los valores de todas", async () => {
    render(
        <AsistenteRuntimeProvider>
            <Chat />
        </AsistenteRuntimeProvider>
    );

    const textarea = await screen.findByPlaceholderText("Escribe un mensaje…");
    await userEvent.type(textarea, "Busca manzana");
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));

    await userEvent.click(await screen.findByText("Manzana Golden (ID: A1)"));
    await userEvent.click(await screen.findByText("Manzana Fuji (ID: A2)"));

    // "Enviar" aparece dos veces: el propio botón de la lista de selección y el del
    // compositor del chat — el de la lista es el primero en el DOM (aparece dentro
    // del mensaje, por encima del compositor).
    const [botonListaSeleccion] = await screen.findAllByRole("button", { name: "Enviar" });
    await userEvent.click(botonListaSeleccion);

    expect(enviarAccionA2ui).toHaveBeenCalledWith(
        expect.objectContaining({
            name: "select",
            context: {
                value: "El artículo es Manzana Golden (id: A1); El artículo es Manzana Fuji (id: A2)",
            },
        }),
        "hilo-1"
    );
});

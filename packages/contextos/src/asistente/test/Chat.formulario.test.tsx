import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { test, expect, vi, beforeEach } from "vitest";
import { AsistenteRuntimeProvider } from "#/asistente/vistas/AsistenteRuntimeProvider.tsx";
import { Chat } from "#/asistente/vistas/Chat.tsx";
import { enviarAccionA2ui } from "#/asistente/infraestructura.ts";

const respuestaConFormulario = {
    respuesta: "Antes de crear el pedido necesito la cantidad.",
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
                        component: "Formulario",
                        titulo: "Faltan datos para crear el pedido",
                        campos: [
                            { nombre: "cantidad", etiqueta: "Cantidad", tipo: "numero", obligatorio: true },
                        ],
                        textoBoton: "Continuar",
                    },
                ],
            },
        },
    ],
    capacidadesHash: null,
    necesitaCapacidades: false,
    accionNavegacion: null,
};

const respuestaTrasFormulario = {
    respuesta: "Pedido creado con 5 unidades.",
    threadId: "hilo-1",
    a2uiMessages: [],
    capacidadesHash: null,
    necesitaCapacidades: false,
    accionNavegacion: null,
};

vi.mock("#/asistente/infraestructura.ts", () => ({
    consultarIa: vi.fn(async () => respuestaConFormulario),
    consultarIaStream: vi.fn(),
    listarHilos: vi.fn(async () => []),
    obtenerMensajesHilo: vi.fn(async () => ({ threadId: "hilo-1", mensajes: [] })),
    enviarAccionA2ui: vi.fn(async () => respuestaTrasFormulario),
}));

beforeEach(() => {
    localStorage.clear();
    globalThis.ResizeObserver ??= class {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
    Element.prototype.scrollTo ??= () => {};
    vi.mocked(enviarAccionA2ui).mockClear();
});

test("[asistente-formulario-01] rellenar y enviar el formulario reenvía los valores como texto al asistente", async () => {
    render(
        <AsistenteRuntimeProvider>
            <Chat />
        </AsistenteRuntimeProvider>
    );

    const textarea = await screen.findByPlaceholderText("Escribe un mensaje…");
    await userEvent.type(textarea, "Crea un pedido para Acme");
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));

    const campoCantidad = await screen.findByLabelText(/Cantidad/);
    await userEvent.type(campoCantidad, "5");
    await userEvent.click(screen.getByRole("button", { name: "Continuar" }));

    expect(enviarAccionA2ui).toHaveBeenCalledWith(
        expect.objectContaining({
            name: "select",
            context: { value: 'DATOS_FORMULARIO: {"cantidad":"5"}' },
        }),
        "hilo-1"
    );

    await screen.findByText("Pedido creado con 5 unidades.");
});

test("[asistente-formulario-02] no envía nada mientras falte un campo obligatorio", async () => {
    render(
        <AsistenteRuntimeProvider>
            <Chat />
        </AsistenteRuntimeProvider>
    );

    const textarea = await screen.findByPlaceholderText("Escribe un mensaje…");
    await userEvent.type(textarea, "Crea un pedido para Acme");
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));

    const botonContinuar = await screen.findByRole("button", { name: "Continuar" });
    await userEvent.click(botonContinuar);
    expect(enviarAccionA2ui).not.toHaveBeenCalled();

    const campoCantidad = screen.getByLabelText(/Cantidad/);
    await userEvent.type(campoCantidad, "5");
    await userEvent.click(botonContinuar);
    expect(enviarAccionA2ui).toHaveBeenCalledTimes(1);
});

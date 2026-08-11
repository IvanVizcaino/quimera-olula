import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { test, expect, vi, beforeEach } from "vitest";
import { AsistenteRuntimeProvider } from "#/asistente/vistas/AsistenteRuntimeProvider.tsx";
import { Chat } from "#/asistente/vistas/Chat.tsx";

const respuestaConTarjetaResultado = {
    respuesta: 'Acción "crear_presupuesto" completada.',
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
                        component: "TarjetaResultado",
                        titulo: "Presupuesto creado",
                        detalles: [{ etiqueta: "id", valor: "P1" }],
                        textoBoton: "Ver presupuesto",
                        accion: {
                            event: {
                                name: "navegar",
                                context: { ruta: "/ventas/presupuesto", parametros: { id: "P1" } },
                            },
                        },
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
    consultarIa: vi.fn(async () => respuestaConTarjetaResultado),
    consultarIaStream: vi.fn(),
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

test("[asistente-resultado-01] click en el botón de TarjetaResultado dispara onAccionNavegacion", async () => {
    const onAccionNavegacion = vi.fn();

    render(
        <AsistenteRuntimeProvider onAccionNavegacion={onAccionNavegacion}>
            <Chat />
        </AsistenteRuntimeProvider>
    );

    const textarea = await screen.findByPlaceholderText("Escribe un mensaje…");
    await userEvent.type(textarea, "Crea un presupuesto");
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));

    const boton = await screen.findByRole("button", { name: "Ver presupuesto" });
    expect(onAccionNavegacion).not.toHaveBeenCalled();

    await userEvent.click(boton);

    expect(onAccionNavegacion).toHaveBeenCalledWith({ ruta: "/ventas/presupuesto", parametros: { id: "P1" } });
});

test("[asistente-resultado-02] la burbuja de texto del LLM se oculta cuando ya hay una TarjetaResultado", async () => {
    render(
        <AsistenteRuntimeProvider>
            <Chat />
        </AsistenteRuntimeProvider>
    );

    const textarea = await screen.findByPlaceholderText("Escribe un mensaje…");
    await userEvent.type(textarea, "Crea un presupuesto");
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));

    // La tarjeta debe verse...
    await screen.findByText("Presupuesto creado");
    // ...pero el texto del LLM que la acompaña (redundante con el título de la
    // tarjeta) no debe renderizarse.
    expect(screen.queryByText('Acción "crear_presupuesto" completada.')).not.toBeInTheDocument();
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { test, expect, vi, beforeEach } from "vitest";
import { AsistenteRuntimeProvider } from "#/asistente/vistas/AsistenteRuntimeProvider.tsx";
import { Chat } from "#/asistente/vistas/Chat.tsx";
import { obtenerMensajesHilo } from "#/asistente/infraestructura.ts";

const respuestaConTabla = {
    respuesta: "Aquí tienes las facturas.",
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
                    { id: "root", component: "Column", children: ["titulo", "tabla"] },
                    { id: "titulo", component: "Text", variant: "h2", text: "Se encontraron 1 facturas." },
                    {
                        id: "tabla",
                        component: "Tabla",
                        columnas: [{ id: "id", cabecera: "ID" }],
                        filas: [{ id: "F1" }],
                        enlaceFila: { ruta: "/ventas/factura" },
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
    consultarIa: vi.fn(async () => respuestaConTabla),
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

test("[asistente-chat-01] click en fila con enlaceFila dispara onAccionNavegacion", async () => {
    const onAccionNavegacion = vi.fn();

    render(
        <AsistenteRuntimeProvider onAccionNavegacion={onAccionNavegacion}>
            <Chat />
        </AsistenteRuntimeProvider>
    );

    const textarea = await screen.findByPlaceholderText("Escribe un mensaje…");
    await userEvent.type(textarea, "Dame las facturas");
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));

    const celda = await screen.findByText("F1");
    await userEvent.click(celda);

    expect(onAccionNavegacion).toHaveBeenCalledWith({
        ruta: "/ventas/factura",
        parametros: { id: "F1" },
    });
});

test("[asistente-chat-02] click sigue funcionando tras restaurar un hilo persistido al abrir el panel", async () => {
    localStorage.setItem("quimera-preferencias", JSON.stringify({ "asistente.threadIdActivo": "hilo-viejo" }));
    vi.mocked(obtenerMensajesHilo).mockResolvedValueOnce({
        threadId: "hilo-viejo",
        mensajes: [
            { id: "m1-u", rol: "user", texto: "Dame las facturas antiguas", a2uiMessages: [], adjuntos: [] },
            {
                id: "m1-a",
                rol: "assistant",
                texto: "Aquí tienes las facturas antiguas.",
                adjuntos: [],
                a2uiMessages: [
                    {
                        version: "v0.9",
                        createSurface: {
                            surfaceId: "hilo-viejo-0",
                            catalogId: "https://a2ui.org/specification/v0_9/basic_catalog.json",
                        },
                    },
                    {
                        version: "v0.9",
                        updateComponents: {
                            surfaceId: "hilo-viejo-0",
                            components: [
                                {
                                    id: "root", component: "Tabla",
                                    columnas: [{ id: "id", cabecera: "ID" }],
                                    filas: [{ id: "F0" }],
                                    enlaceFila: { ruta: "/ventas/factura" },
                                },
                            ],
                        },
                    },
                ],
            },
        ],
    });

    const onAccionNavegacion = vi.fn();

    render(
        <AsistenteRuntimeProvider onAccionNavegacion={onAccionNavegacion}>
            <Chat />
        </AsistenteRuntimeProvider>
    );

    // Espera a que el hilo persistido se restaure (mensaje + tabla reconstruidos)
    const celdaVieja = await screen.findByText("F0");
    await userEvent.click(celdaVieja);
    expect(onAccionNavegacion).toHaveBeenCalledWith({
        ruta: "/ventas/factura",
        parametros: { id: "F0" },
    });

    // Y un mensaje NUEVO tras la restauración también debe seguir funcionando
    onAccionNavegacion.mockClear();
    const textarea = await screen.findByPlaceholderText("Escribe un mensaje…");
    await userEvent.type(textarea, "Dame las facturas");
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));

    const celda = await screen.findByText("F1");
    await userEvent.click(celda);
    expect(onAccionNavegacion).toHaveBeenCalledWith({
        ruta: "/ventas/factura",
        parametros: { id: "F1" },
    });
});

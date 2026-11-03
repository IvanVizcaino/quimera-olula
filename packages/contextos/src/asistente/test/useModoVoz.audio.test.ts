import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { DetectorActivacion } from "@olula/lib/voz/detector_activacion.ts";
import { grabarFrase, type AudioGrabado } from "@olula/lib/voz/grabar_frase.ts";
import { establecerModoVoz } from "@olula/lib/voz/modo_voz.ts";
import { consultarIaStream, enviarAccionA2ui, listarHilos } from "#/asistente/infraestructura.ts";
import type { EventoStreamIa, RespuestaIa } from "#/asistente/diseño.ts";
import { useModoVoz } from "#/asistente/vistas/modo_voz/useModoVoz.ts";

const tts = vi.hoisted(() => ({
    hablar: vi.fn(async (_texto: string) => undefined),
    detener: vi.fn(),
}));

vi.mock("@olula/lib/voz/useSintesisVoz.ts", () => ({
    useSintesisVoz: () => ({ soportado: true, hablando: false, vocesDisponibles: true, ...tts }),
}));
vi.mock("@olula/lib/voz/tonos.ts", () => ({ reproducirTono: vi.fn() }));
vi.mock("@olula/lib/voz/grabar_frase.ts", () => ({ grabarFrase: vi.fn() }));
// Navegador sin reconocimiento de voz (Firefox): modo audio.
vi.mock("@olula/lib/voz/modo_voz.ts", async importOriginal => ({
    ...(await importOriginal<typeof import("@olula/lib/voz/modo_voz.ts")>()),
    modoCapturaVoz: () => "audio",
}));
vi.mock("@olula/lib/dominio.ts", () => ({ puede: () => true, plugin: () => "inactivo" }));
vi.mock("#/asistente/infraestructura.ts", () => ({
    consultarIa: vi.fn(),
    consultarIaStream: vi.fn(),
    enviarAccionA2ui: vi.fn(),
    listarHilos: vi.fn(),
}));

const reconocimientoNavegador = vi.fn();

const audio: AudioGrabado = { datosBase64: "QUJD", tipoMime: "audio/webm;codecs=opus" };

/** Cada llamada a grabarFrase queda pendiente hasta que el test la resuelve. */
let grabaciones: { resolver: (a: AudioGrabado | null) => void; fallar: (e: Error) => void; signal?: AbortSignal }[] = [];

const stream = (...eventos: EventoStreamIa[]) => (async function* () {
    for (const evento of eventos) yield evento;
})();

const fin: EventoStreamIa = { tipo: "fin", threadId: "voz-1", adjuntos: [] };

beforeEach(() => {
    grabaciones = [];
    reconocimientoNavegador.mockReset();
    vi.stubGlobal("SpeechRecognition", reconocimientoNavegador);
    tts.hablar.mockReset().mockResolvedValue(undefined);
    tts.detener.mockReset();
    vi.mocked(grabarFrase).mockReset().mockImplementation(opciones => new Promise((resolver, fallar) => {
        grabaciones.push({ resolver, fallar, signal: opciones?.signal });
    }));
    vi.mocked(listarHilos).mockReset().mockResolvedValue([
        { threadId: "voz-1", titulo: "Voz", actualizadoEn: "", canal: "voz" },
    ]);
    vi.mocked(consultarIaStream).mockReset().mockImplementation(() => stream(
        { tipo: "delta", contenido: "Tienes 3 pedidos pendientes." }, fin,
    ));
    vi.mocked(enviarAccionA2ui).mockReset().mockResolvedValue({
        respuesta: "Pedido creado.", threadId: "voz-1", a2uiMessages: [], capacidadesHash: null,
        necesitaCapacidades: false, accionNavegacion: null, descarga: null, accionesPantalla: [], adjuntos: [], encolado: false,
    } satisfies RespuestaIa);
    establecerModoVoz(true);
});

afterEach(() => {
    act(() => establecerModoVoz(false));
    vi.unstubAllGlobals();
});

const ultimaGrabacion = () => grabaciones[grabaciones.length - 1];

describe("[asistente-voz-20] useModoVoz en modo audio (sin reconocimiento de voz)", () => {
    test("en espera no abre el micro ni usa el reconocimiento del navegador", () => {
        const { result } = renderHook(() => useModoVoz());
        expect(result.current.modoCaptura).toBe("audio");
        expect(result.current.estado).toBe("en_espera");
        expect(grabarFrase).not.toHaveBeenCalled();
        expect(reconocimientoNavegador).not.toHaveBeenCalled();
    });

    test("pulsar para hablar: graba, manda el audio al hilo de voz y lee la respuesta", async () => {
        const { result } = renderHook(() => useModoVoz());
        act(() => result.current.hablarAhora());
        expect(result.current.estado).toBe("escuchando_orden");
        await waitFor(() => expect(grabarFrase).toHaveBeenCalledWith(expect.objectContaining({ esperaInicioMs: 8_000 })));

        await act(async () => ultimaGrabacion().resolver(audio));
        await waitFor(() => expect(consultarIaStream).toHaveBeenCalledWith(expect.objectContaining({
            pregunta: "", threadId: "voz-1", canal: "voz",
            adjuntos: [{ nombre: "orden-voz.webm", tipoMime: "audio/webm;codecs=opus", datosBase64: "QUJD" }],
        }), expect.any(AbortSignal)));
        expect(result.current.orden).toBe("Nota de voz");
        await waitFor(() => expect(tts.hablar).toHaveBeenCalledWith("Tienes 3 pedidos pendientes."));
    });

    test("tras responder vuelve a grabar para seguir la conversación, y si no se habla vuelve a esperar", async () => {
        const { result } = renderHook(() => useModoVoz());
        act(() => result.current.hablarAhora());
        await waitFor(() => expect(grabaciones).toHaveLength(1));
        await act(async () => ultimaGrabacion().resolver(audio));

        await waitFor(() => expect(grabaciones).toHaveLength(2));
        expect(vi.mocked(grabarFrase).mock.calls[1][0]).toMatchObject({ esperaInicioMs: 6_000 });
        expect(result.current.estado).toBe("escuchando_orden");

        await act(async () => ultimaGrabacion().resolver(null));
        expect(result.current.estado).toBe("en_espera");
    });

    test("pulsar mientras habla lo interrumpe y graba la nueva orden", async () => {
        tts.hablar.mockImplementation(() => new Promise<undefined>(() => {}));
        const { result } = renderHook(() => useModoVoz());
        act(() => result.current.hablarAhora());
        await waitFor(() => expect(grabaciones).toHaveLength(1));
        await act(async () => ultimaGrabacion().resolver(audio));
        await waitFor(() => expect(result.current.estado).toBe("respondiendo"));

        act(() => result.current.hablarAhora());
        expect(tts.detener).toHaveBeenCalled();
        expect(result.current.estado).toBe("escuchando_orden");
        await waitFor(() => expect(grabaciones).toHaveLength(2));
    });

    test("cancelar mientras graba aborta la grabación sin enviar nada", async () => {
        const { result } = renderHook(() => useModoVoz());
        act(() => result.current.hablarAhora());
        await waitFor(() => expect(grabaciones).toHaveLength(1));
        act(() => result.current.cancelar());
        expect(ultimaGrabacion().signal?.aborted).toBe(true);
        await act(async () => ultimaGrabacion().resolver(null));
        expect(result.current.estado).toBe("en_espera");
        expect(consultarIaStream).not.toHaveBeenCalled();
    });

    test("las confirmaciones se piden con los botones", async () => {
        vi.mocked(consultarIaStream).mockImplementation(() => stream({
            tipo: "a2ui",
            a2uiMessage: {
                updateComponents: {
                    surfaceId: "conf-1",
                    components: [{ id: "root", component: "TarjetaConfirmacion", titulo: "¿Crear el pedido?" }],
                },
            },
        }, fin));
        const { result } = renderHook(() => useModoVoz({ onMostrarHilo: vi.fn() }));
        act(() => result.current.hablarAhora());
        await waitFor(() => expect(grabaciones).toHaveLength(1));
        await act(async () => ultimaGrabacion().resolver(audio));

        await waitFor(() => expect(result.current.estado).toBe("confirmando"));
        expect(tts.hablar).toHaveBeenCalledWith("Crear el pedido. ¿Lo confirmo? Pulsa sí o no en pantalla.");
        expect(grabaciones).toHaveLength(1);

        act(() => result.current.confirmar(true));
        await waitFor(() => expect(enviarAccionA2ui).toHaveBeenCalledWith(
            expect.objectContaining({ name: "confirm", surfaceId: "conf-1", context: { value: true } }), "voz-1"));
    });

    test("si no se puede abrir el micro, error con el motivo; reintentar vuelve a la espera", async () => {
        const { result } = renderHook(() => useModoVoz());
        act(() => result.current.hablarAhora());
        await waitFor(() => expect(grabaciones).toHaveLength(1));
        await act(async () => ultimaGrabacion().fallar(new Error("NotAllowedError")));
        expect(result.current.estado).toBe("error");
        expect(result.current.error).toBe("No se ha podido abrir el micrófono");

        act(() => result.current.reintentar());
        expect(result.current.estado).toBe("en_espera");
        expect(result.current.error).toBeNull();
    });

    test("con un detector local, la frase de activación empieza a grabar", async () => {
        const parar = vi.fn();
        let activar = () => {};
        const detector: DetectorActivacion = {
            escuchar: vi.fn(async onActivacion => {
                activar = onActivacion;
                return parar;
            }),
        };
        const { result } = renderHook(() => useModoVoz({ detector }));
        await waitFor(() => expect(detector.escuchar).toHaveBeenCalled());

        act(() => activar());
        expect(result.current.estado).toBe("escuchando_orden");
        // Fuera de la espera el detector suelta el micro (lo usa la grabación).
        expect(parar).toHaveBeenCalled();
        await waitFor(() => expect(grabaciones).toHaveLength(1));
    });
});

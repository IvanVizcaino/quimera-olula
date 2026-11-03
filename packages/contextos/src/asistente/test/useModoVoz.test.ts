import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { establecerModoVoz, modoVozActivo } from "@olula/lib/voz/modo_voz.ts";
import { reservarVoz } from "@olula/lib/voz/voz_ocupada.ts";
import { limpiarControlesPantalla, registrarControl } from "@olula/lib/controles_pantalla.ts";
import { consultarIa, consultarIaStream, enviarAccionA2ui, listarHilos } from "#/asistente/infraestructura.ts";
import { getComunicaciones } from "#/comun/comunicacion/infraestructura.ts";
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
vi.mock("@olula/lib/dominio.ts", () => ({ puede: () => true, plugin: () => "activo" }));
const sse = vi.hoisted(() => ({ manejadores: new Map<string, (e: { data: string }) => void>() }));
vi.mock("@olula/lib/api/server_sent_events_session.ts", () => ({
    onGlobalServerSentEvent: (tipo: string, manejador: (e: { data: string }) => void) => {
        sse.manejadores.set(tipo, manejador);
        return () => sse.manejadores.delete(tipo);
    },
}));
vi.mock("@olula/lib/api/notificaciones.ts", () => ({ getTotalComunicacionesNoLeidas: vi.fn(async () => 2) }));
vi.mock("#/comun/comunicacion/infraestructura.ts", () => ({ getComunicaciones: vi.fn() }));
vi.mock("#/asistente/infraestructura.ts", () => ({
    consultarIa: vi.fn(),
    consultarIaStream: vi.fn(),
    enviarAccionA2ui: vi.fn(),
    listarHilos: vi.fn(),
}));

class FakeRecognition {
    static instancias: FakeRecognition[] = [];
    lang = "";
    continuous = false;
    interimResults = false;
    maxAlternatives = 1;
    onresult: ((e: unknown) => void) | null = null;
    onerror: ((e: { error: string }) => void) | null = null;
    onend: (() => void) | null = null;
    start = vi.fn();
    stop = vi.fn();
    abort = vi.fn();

    constructor() {
        FakeRecognition.instancias.push(this);
    }
}

const activa = () => [...FakeRecognition.instancias].reverse().find(r => !r.abort.mock.calls.length);

const decir = (texto: string, final = true) => act(() => {
    const resultado = Object.assign([{ transcript: texto, confidence: 1 }], { isFinal: final });
    activa()?.onresult?.({ resultIndex: 0, results: [resultado] });
});

const respuesta = (parcial: Partial<RespuestaIa> = {}): RespuestaIa => ({
    respuesta: "Tienes **3** pedidos pendientes.",
    threadId: "voz-1",
    a2uiMessages: [],
    capacidadesHash: "hash-1",
    necesitaCapacidades: false,
    accionNavegacion: null,
    descarga: null,
    accionesPantalla: [],
    adjuntos: [],
    encolado: false,
    ...parcial,
});

const fin: EventoStreamIa = { tipo: "fin", threadId: "voz-1", adjuntos: [] };

const stream = (...eventos: EventoStreamIa[]) => (async function* () {
    for (const evento of eventos) yield evento;
})();

/** Stream que se va alimentando desde el test, para comprobar qué pasa a mitad. */
const streamControlado = () => {
    const cola: (EventoStreamIa | null)[] = [];
    let avisar: (() => void) | null = null;
    const meter = (evento: EventoStreamIa | null) => {
        cola.push(evento);
        avisar?.();
    };
    const generador = (async function* () {
        while (true) {
            if (!cola.length) await new Promise<void>(r => { avisar = r; });
            avisar = null;
            const evento = cola.shift();
            if (evento === undefined) continue;
            if (evento === null) return;
            yield evento;
        }
    })();
    return { generador, emitir: (e: EventoStreamIa) => meter(e), terminar: () => meter(null) };
};

const tarjetaConfirmacion = {
    version: "v0.9",
    updateComponents: {
        surfaceId: "conf-1",
        components: [{
            id: "root", component: "TarjetaConfirmacion",
            titulo: "¿Confirmar la acción \"Crear pedido\"?",
            detalles: [{ etiqueta: "Cliente", valor: "Acme" }],
        }],
    },
};

beforeEach(() => {
    FakeRecognition.instancias = [];
    vi.stubGlobal("SpeechRecognition", FakeRecognition);
    tts.hablar.mockReset().mockResolvedValue(undefined);
    tts.detener.mockReset();
    vi.mocked(listarHilos).mockReset().mockResolvedValue([
        { threadId: "web-1", titulo: "Otra", actualizadoEn: "", canal: "web" },
        { threadId: "voz-1", titulo: "Voz", actualizadoEn: "", canal: "voz" },
    ]);
    vi.mocked(consultarIaStream).mockReset().mockImplementation(() => stream(
        { tipo: "delta", contenido: "Tienes **3** pedidos " },
        { tipo: "delta", contenido: "pendientes." },
        fin,
    ));
    vi.mocked(consultarIa).mockReset().mockResolvedValue(respuesta());
    vi.mocked(enviarAccionA2ui).mockReset().mockResolvedValue(respuesta({ respuesta: "Pedido creado." }));
    establecerModoVoz(true);
});

afterEach(() => {
    act(() => establecerModoVoz(false));
    vi.unstubAllGlobals();
});

describe("[asistente-voz-10] useModoVoz: activación y órdenes", () => {
    test("inactivo mientras el modo voz está desactivado", () => {
        act(() => establecerModoVoz(false));
        const { result } = renderHook(() => useModoVoz());
        expect(result.current.estado).toBe("inactivo");
        expect(activa()).toBeUndefined();
    });

    test("«Oye Olula» + orden: consulta en el hilo de voz, lee la respuesta y sigue escuchando", async () => {
        const { result } = renderHook(() => useModoVoz());
        expect(result.current.estado).toBe("en_espera");

        decir("Oye Olula cuántos pedidos tengo");

        await waitFor(() => expect(result.current.estado).toBe("escuchando_orden"));
        expect(consultarIaStream).toHaveBeenCalledWith(expect.objectContaining({
            pregunta: "cuántos pedidos tengo", threadId: "voz-1", canal: "voz", capacidades: expect.any(Array),
        }), expect.any(AbortSignal));
        expect(tts.hablar).toHaveBeenCalledWith("Tienes 3 pedidos pendientes.");
        expect(result.current.threadId).toBe("voz-1");

        // Seguimiento: sin repetir la frase de activación.
        decir("y cuántos clientes");
        await waitFor(() => expect(consultarIaStream).toHaveBeenCalledTimes(2));
        expect(vi.mocked(consultarIaStream).mock.calls[1][0]).toMatchObject({
            pregunta: "y cuántos clientes", threadId: "voz-1",
        });
        expect(listarHilos).toHaveBeenCalledTimes(1);
    });

    test("la frase de activación sola espera la orden en la frase siguiente", async () => {
        const { result } = renderHook(() => useModoVoz());
        decir("oye olula", false);
        expect(result.current.estado).toBe("escuchando_orden");
        decir("oye olula", true);
        expect(consultarIaStream).not.toHaveBeenCalled();
        decir("abre los clientes", false);
        expect(result.current.textoEnVivo).toBe("abre los clientes");
        decir("abre los clientes");
        await waitFor(() => expect(consultarIaStream).toHaveBeenCalledWith(
            expect.objectContaining({ pregunta: "abre los clientes" }), expect.any(AbortSignal)));
    });

    test("pulsar para hablar (botón o atajo) escucha la orden sin frase de activación", async () => {
        const { result } = renderHook(() => useModoVoz());
        expect(result.current.modoCaptura).toBe("texto");
        act(() => result.current.hablarAhora());
        expect(result.current.estado).toBe("escuchando_orden");
        decir("abre los clientes");
        await waitFor(() => expect(consultarIaStream).toHaveBeenCalledWith(
            expect.objectContaining({ pregunta: "abre los clientes" }), expect.any(AbortSignal)));
    });

    test("los precios dictados llegan con coma decimal", async () => {
        renderHook(() => useModoVoz());
        decir("oye olula cambia el precio del artículo a doce con cincuenta");
        await waitFor(() => expect(consultarIaStream).toHaveBeenCalledWith(
            expect.objectContaining({ pregunta: "cambia el precio del artículo a 12,50" }), expect.any(AbortSignal)));
    });

    test("sin frase de activación no se envía nada", () => {
        const { result } = renderHook(() => useModoVoz());
        decir("vamos a revisar los pedidos");
        expect(result.current.estado).toBe("en_espera");
        expect(consultarIaStream).not.toHaveBeenCalled();
    });

    test("vuelve a esperar la frase si no llega ninguna orden", () => {
        vi.useFakeTimers();
        try {
            const { result } = renderHook(() => useModoVoz());
            decir("oye olula", false);
            expect(result.current.estado).toBe("escuchando_orden");
            act(() => vi.advanceTimersByTime(8_000));
            expect(result.current.estado).toBe("en_espera");
        } finally {
            vi.useRealTimers();
        }
    });

    test("navega sin confirmar y abre el chat si la respuesta trae contenido visual", async () => {
        const onNavegar = vi.fn();
        const onMostrarHilo = vi.fn();
        vi.mocked(consultarIaStream).mockImplementation(() => stream(
            { tipo: "delta", contenido: "Estos son tus pedidos." },
            { tipo: "accion_navegacion", accionNavegacion: { ruta: "/ventas/pedido" } },
            { tipo: "a2ui", a2uiMessage: { updateComponents: { surfaceId: "s", components: [{ component: "Tabla" }] } } },
            fin,
        ));
        renderHook(() => useModoVoz({ onNavegar, onMostrarHilo }));
        decir("oye olula llévame a los pedidos");
        await waitFor(() => expect(onNavegar).toHaveBeenCalledWith(expect.objectContaining({ ruta: "/ventas/pedido" })));
        expect(onMostrarHilo).toHaveBeenCalledWith("voz-1");
        await waitFor(() => expect(tts.hablar).toHaveBeenCalledWith("Te lo muestro en el chat."));
    });

    test("«Oye Olula, deja de escuchar» desactiva el modo voz", async () => {
        const { result } = renderHook(() => useModoVoz());
        decir("oye olula deja de escuchar");
        await waitFor(() => expect(result.current.estado).toBe("inactivo"));
        expect(modoVozActivo()).toBe(false);
        expect(consultarIaStream).not.toHaveBeenCalled();
    });

    test("permiso de micrófono denegado: estado error con el motivo, y se puede reintentar", () => {
        const { result } = renderHook(() => useModoVoz());
        act(() => {
            activa()?.onerror?.({ error: "not-allowed" });
        });
        expect(result.current.estado).toBe("error");
        expect(result.current.error).toBe("Permiso de micrófono denegado");
        act(() => result.current.reintentar());
        expect(result.current.estado).toBe("en_espera");
    });
});

describe("[asistente-voz-11] useModoVoz: respuesta en streaming", () => {
    test("empieza a leer la primera frase antes de que termine la respuesta", async () => {
        const s = streamControlado();
        vi.mocked(consultarIaStream).mockImplementation(() => s.generador);
        const { result } = renderHook(() => useModoVoz());
        decir("oye olula resumen de ventas");

        await act(async () => s.emitir({ tipo: "delta", contenido: "Este mes has vendido 12.000 euros. Y el" }));
        await waitFor(() => expect(tts.hablar).toHaveBeenCalledWith("Este mes has vendido 12000 euros."));
        expect(result.current.estado).toBe("respondiendo");

        await act(async () => {
            s.emitir({ tipo: "delta", contenido: " mejor cliente es Acme." });
            s.emitir(fin);
            s.terminar();
        });
        await waitFor(() => expect(result.current.estado).toBe("escuchando_orden"));
        expect(tts.hablar).toHaveBeenLastCalledWith("Y el mejor cliente es Acme.");
    });

    test("muestra los avisos de progreso y descarta lo que el backend retira", async () => {
        const s = streamControlado();
        vi.mocked(consultarIaStream).mockImplementation(() => s.generador);
        const { result } = renderHook(() => useModoVoz());
        decir("oye olula pedidos de Acme");

        await act(async () => {
            s.emitir({ tipo: "delta", contenido: "Voy a mirar" });
            s.emitir({ tipo: "estado", contenido: "Buscando el cliente…" });
        });
        await waitFor(() => expect(result.current.progreso).toBe("Buscando el cliente…"));

        await act(async () => {
            s.emitir({ tipo: "delta", contenido: "Acme tiene 2 pedidos." });
            s.emitir(fin);
            s.terminar();
        });
        await waitFor(() => expect(result.current.estado).toBe("escuchando_orden"));
        expect(tts.hablar.mock.calls.map(c => c[0])).toEqual(["Acme tiene 2 pedidos."]);
    });

    test("no lee JSON ni bloques internos que se cuelen en el texto", async () => {
        vi.mocked(consultarIaStream).mockImplementation(() => stream(
            { tipo: "delta", contenido: "Hecho el cálculo. {\"total\": 3} " },
            { tipo: "delta", contenido: "Total tres pedidos." },
            fin,
        ));
        const { result } = renderHook(() => useModoVoz());
        decir("oye olula total");
        await waitFor(() => expect(result.current.estado).toBe("escuchando_orden"));
        expect(tts.hablar.mock.calls.map(c => c[0]).join(" ")).not.toContain("{");
    });

    test("si el stream falla sin haber leído nada, pide la respuesta completa", async () => {
        vi.mocked(consultarIaStream).mockImplementation(() => stream({ tipo: "error", contenido: "boom" }));
        const { result } = renderHook(() => useModoVoz());
        decir("oye olula hola");
        await waitFor(() => expect(result.current.estado).toBe("escuchando_orden"));
        expect(consultarIa).toHaveBeenCalledWith(expect.objectContaining({ pregunta: "hola", canal: "voz" }));
        expect(tts.hablar).toHaveBeenCalledWith("Tienes 3 pedidos pendientes.");
    });

    test("crea el hilo de voz si el usuario aún no tiene", async () => {
        vi.mocked(listarHilos).mockResolvedValue([]);
        const { result } = renderHook(() => useModoVoz());
        decir("oye olula hola");
        await waitFor(() => expect(consultarIaStream).toHaveBeenCalledWith(
            expect.objectContaining({ threadId: null, canal: "voz" }), expect.any(AbortSignal)));
        await waitFor(() => expect(result.current.threadId).toBe("voz-1"));
    });

    test("si el hilo de voz se ha borrado, empieza uno nuevo", async () => {
        vi.mocked(consultarIaStream).mockImplementation(() => stream({ tipo: "error", contenido: "hilo" }));
        vi.mocked(consultarIa)
            .mockRejectedValueOnce({ nombre: "Error", descripcion: "comun.ia.hilo: voz-1" })
            .mockResolvedValueOnce(respuesta({ threadId: "voz-2" }));
        const { result } = renderHook(() => useModoVoz());
        decir("oye olula hola");
        await waitFor(() => expect(consultarIa).toHaveBeenCalledTimes(2));
        expect(vi.mocked(consultarIa).mock.calls[1][0]).toMatchObject({ threadId: null, canal: "voz" });
        await waitFor(() => expect(result.current.threadId).toBe("voz-2"));
    });

    test("un error de la API se dice en voz alta y no rompe el modo", async () => {
        vi.mocked(consultarIaStream).mockImplementation(() => stream({ tipo: "error", contenido: "boom" }));
        vi.mocked(consultarIa).mockRejectedValue({ nombre: "Error", descripcion: "500" });
        const { result } = renderHook(() => useModoVoz());
        decir("oye olula hola");
        await waitFor(() => expect(result.current.estado).toBe("escuchando_orden"));
        expect(tts.hablar).toHaveBeenCalledWith(expect.stringContaining("No he podido"));
    });
});

describe("[asistente-voz-12] useModoVoz: interrumpir", () => {
    const hablandoSinFin = () => {
        tts.hablar.mockImplementation(() => new Promise<undefined>(() => {}));
    };

    test("«para» mientras piensa cancela y descarta la respuesta", async () => {
        const s = streamControlado();
        vi.mocked(consultarIaStream).mockImplementation(() => s.generador);
        const { result } = renderHook(() => useModoVoz());
        decir("oye olula cuántos pedidos");
        await waitFor(() => expect(result.current.estado).toBe("procesando"));

        decir("para");
        expect(result.current.estado).toBe("en_espera");
        await act(async () => {
            s.emitir({ tipo: "delta", contenido: "Tienes 3 pedidos." });
            s.emitir(fin);
            s.terminar();
        });
        expect(tts.hablar).not.toHaveBeenCalled();
        expect(result.current.estado).toBe("en_espera");
    });

    test("«Olula, para» mientras habla corta la lectura", async () => {
        hablandoSinFin();
        const { result } = renderHook(() => useModoVoz());
        decir("oye olula cuántos pedidos");
        await waitFor(() => expect(result.current.estado).toBe("respondiendo"));

        decir("olula para");
        expect(tts.detener).toHaveBeenCalled();
        expect(result.current.estado).toBe("en_espera");
    });

    test("la frase de activación mientras habla lo corta y escucha la nueva orden", async () => {
        hablandoSinFin();
        const { result } = renderHook(() => useModoVoz());
        decir("oye olula cuántos pedidos");
        await waitFor(() => expect(result.current.estado).toBe("respondiendo"));

        decir("oye olula", false);
        expect(tts.detener).toHaveBeenCalled();
        expect(result.current.estado).toBe("escuchando_orden");
        decir("oye olula y los clientes");
        await waitFor(() => expect(consultarIaStream).toHaveBeenCalledTimes(2));
        expect(vi.mocked(consultarIaStream).mock.calls[1][0]).toMatchObject({ pregunta: "y los clientes" });
    });

    test("no reacciona a su propia voz (eco por los altavoces)", async () => {
        hablandoSinFin();
        vi.mocked(consultarIaStream).mockImplementation(() => stream(
            { tipo: "delta", contenido: "Para ver los pedidos pendientes abre la pantalla de pedidos." }, fin,
        ));
        const { result } = renderHook(() => useModoVoz());
        decir("oye olula cómo veo los pedidos");
        await waitFor(() => expect(result.current.estado).toBe("respondiendo"));

        decir("para ver los pedidos pendientes");
        expect(result.current.estado).toBe("respondiendo");
        expect(tts.detener).not.toHaveBeenCalled();
    });
});

describe("[asistente-voz-13] useModoVoz: confirmaciones por voz", () => {
    const pedirConfirmacion = async () => {
        vi.mocked(consultarIaStream).mockImplementation(() => stream(
            { tipo: "a2ui", a2uiMessage: tarjetaConfirmacion }, fin,
        ));
        const hook = renderHook(() => useModoVoz({ onMostrarHilo: vi.fn() }));
        decir("oye olula crea un pedido para Acme");
        await waitFor(() => expect(hook.result.current.estado).toBe("confirmando"));
        return hook;
    };

    test("lee qué se va a hacer y pregunta", async () => {
        await pedirConfirmacion();
        expect(tts.hablar).toHaveBeenCalledWith(
            "Confirmar la acción \"Crear pedido\". Cliente: Acme. ¿Lo confirmo?");
    });

    test("«sí» confirma la acción en el hilo de voz y lee el resultado", async () => {
        const { result } = await pedirConfirmacion();
        decir("sí, adelante");
        await waitFor(() => expect(enviarAccionA2ui).toHaveBeenCalledWith(
            expect.objectContaining({ name: "confirm", surfaceId: "conf-1", context: { value: true } }), "voz-1"));
        await waitFor(() => expect(result.current.estado).toBe("escuchando_orden"));
        expect(tts.hablar).toHaveBeenCalledWith("Pedido creado.");
    });

    test("«no» cancela la acción", async () => {
        await pedirConfirmacion();
        decir("no");
        await waitFor(() => expect(enviarAccionA2ui).toHaveBeenCalledWith(
            expect.objectContaining({ context: { value: false } }), "voz-1"));
    });

    test("también se puede confirmar desde los botones del orbe", async () => {
        const { result } = await pedirConfirmacion();
        act(() => result.current.confirmar(true));
        await waitFor(() => expect(enviarAccionA2ui).toHaveBeenCalledWith(
            expect.objectContaining({ context: { value: true } }), "voz-1"));
    });

    test("una negación dentro de la frase gana", async () => {
        await pedirConfirmacion();
        decir("pues no sé qué decirte");
        await waitFor(() => expect(enviarAccionA2ui).toHaveBeenCalledWith(
            expect.objectContaining({ context: { value: false } }), "voz-1"));
    });

    test("respuesta ambigua: repregunta y, si sigue sin entenderse, la deja pendiente", async () => {
        const { result } = await pedirConfirmacion();
        decir("hmm el de ayer");
        await waitFor(() => expect(tts.hablar).toHaveBeenCalledWith("Perdona, no te he entendido. ¿Lo confirmo?"));
        expect(result.current.estado).toBe("confirmando");
        // Se contesta cuando ha terminado de preguntar (mientras habla no se escucha).
        await new Promise(r => setTimeout(r, 450));
        decir("el de ayer");
        await waitFor(() => expect(result.current.estado).toBe("en_espera"));
        expect(tts.hablar).toHaveBeenCalledWith("Lo dejo pendiente en el chat.");
        expect(enviarAccionA2ui).not.toHaveBeenCalled();
    });

    test("sin respuesta en 10 s queda pendiente en el chat", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        try {
            const { result } = await pedirConfirmacion();
            act(() => vi.advanceTimersByTime(9_000));
            expect(result.current.estado).toBe("confirmando");
            act(() => vi.advanceTimersByTime(1_000));
            expect(result.current.estado).toBe("en_espera");
        } finally {
            vi.useRealTimers();
        }
        expect(enviarAccionA2ui).not.toHaveBeenCalled();
    });
});

describe("[asistente-voz-14] useModoVoz: convivencia, esperas e inactividad", () => {
    test("se pone en pausa mientras otra pantalla usa la voz (lectura de almacén)", () => {
        const { result } = renderHook(() => useModoVoz());
        expect(activa()).toBeDefined();

        let liberar = () => {};
        act(() => { liberar = reservarVoz(); });
        expect(result.current.pausado).toBe(true);
        expect(activa()).toBeUndefined();
        act(() => result.current.hablarAhora());
        expect(result.current.estado).toBe("en_espera");

        act(() => liberar());
        expect(result.current.pausado).toBe(false);
        expect(activa()).toBeDefined();
    });

    test("si otra pantalla reserva la voz mientras habla, se calla", async () => {
        tts.hablar.mockImplementation(() => new Promise<undefined>(() => {}));
        const { result } = renderHook(() => useModoVoz());
        decir("oye olula cuántos pedidos");
        await waitFor(() => expect(result.current.estado).toBe("respondiendo"));

        let liberar = () => {};
        act(() => { liberar = reservarVoz(); });
        expect(tts.detener).toHaveBeenCalled();
        expect(result.current.estado).toBe("en_espera");
        act(() => liberar());
    });

    test("si tarda en responder, dice en qué está (una vez)", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        try {
            const s = streamControlado();
            vi.mocked(consultarIaStream).mockImplementation(() => s.generador);
            renderHook(() => useModoVoz());
            decir("oye olula pedidos de Acme");
            await act(async () => s.emitir({ tipo: "estado", contenido: "Buscando el cliente…" }));
            await act(async () => { vi.advanceTimersByTime(3_000); });
            expect(tts.hablar).toHaveBeenCalledWith("Buscando el cliente…");
            await act(async () => { vi.advanceTimersByTime(10_000); });
            expect(tts.hablar).toHaveBeenCalledTimes(1);
        } finally {
            vi.useRealTimers();
        }
    });

    test("sin aviso de progreso dice «Un momento…»", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        try {
            const s = streamControlado();
            vi.mocked(consultarIaStream).mockImplementation(() => s.generador);
            renderHook(() => useModoVoz());
            decir("oye olula pedidos de Acme");
            await act(async () => { vi.advanceTimersByTime(3_000); });
            expect(tts.hablar).toHaveBeenCalledWith("Un momento…");
        } finally {
            vi.useRealTimers();
        }
    });

    test("si responde antes de 3 s no avisa de nada", async () => {
        const { result } = renderHook(() => useModoVoz());
        decir("oye olula hola");
        await waitFor(() => expect(result.current.estado).toBe("escuchando_orden"));
        expect(tts.hablar).not.toHaveBeenCalledWith("Un momento…");
    });

    test("se apaga solo tras 30 minutos sin usarlo", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        try {
            const { result } = renderHook(() => useModoVoz());
            await act(async () => { vi.advanceTimersByTime(29 * 60_000); });
            expect(modoVozActivo()).toBe(true);
            await act(async () => { vi.advanceTimersByTime(60_000); });
            expect(tts.hablar).toHaveBeenCalledWith("Desactivo el modo voz por inactividad.");
            await waitFor(() => expect(result.current.estado).toBe("inactivo"));
            expect(modoVozActivo()).toBe(false);
        } finally {
            vi.useRealTimers();
        }
    });
});

describe("[asistente-voz-15] useModoVoz: controlar la pantalla", () => {
    const registrarListado = () => {
        const ejecutar = vi.fn(() => ({ ok: true, mensaje: "Página 2." }));
        registrarControl("listado", {
            describir: () => ({
                tipo: "listado", id: "", campos: [{ id: "cliente", etiqueta: "Cliente", tipo: "texto" }],
                columnasOrden: [], filtro: [], orden: [], pagina: 1, total: 40,
                filas: [{ posicion: 1, id: "p1", texto: "PED-1 · Acme" }],
                seleccionada: null, modo: null, modos: [],
            }),
            ejecutar,
        });
        return ejecutar;
    };

    afterEach(() => limpiarControlesPantalla());

    test("las órdenes cerradas se ejecutan al momento, sin preguntar al asistente", async () => {
        const ejecutar = registrarListado();
        const { result } = renderHook(() => useModoVoz());
        decir("oye olula siguiente página");
        await waitFor(() => expect(ejecutar).toHaveBeenCalledWith("pagina", { pagina: "siguiente" }));
        expect(consultarIaStream).not.toHaveBeenCalled();
        await waitFor(() => expect(tts.hablar).toHaveBeenCalledWith("Página 2."));
        await waitFor(() => expect(result.current.estado).toBe("escuchando_orden"));
    });

    test("la pantalla viaja en la consulta y se ejecutan las acciones que decide el asistente", async () => {
        const ejecutar = registrarListado();
        vi.mocked(consultarIaStream).mockImplementation(() => stream(
            { tipo: "accion_pantalla", accionPantalla: { control: "listado-1", accion: "filtrar", parametros: { campo: "cliente", valor: "Acme" } } },
            fin,
        ));
        renderHook(() => useModoVoz());
        decir("oye olula enséñame solo los de Acme");

        await waitFor(() => expect(ejecutar).toHaveBeenCalledWith("filtrar", { campo: "cliente", valor: "Acme" }));
        const consulta = vi.mocked(consultarIaStream).mock.calls[0][0];
        expect(consulta.contextoApp?.pantalla?.controles).toEqual([
            expect.objectContaining({ id: "listado-1", tipo: "listado", total: 40 }),
        ]);
        // Sin texto del asistente, se confirma con el mensaje de la acción.
        await waitFor(() => expect(tts.hablar).toHaveBeenCalledWith("Página 2."));
    });

    test("si la acción falla, lo dice", async () => {
        vi.mocked(consultarIaStream).mockImplementation(() => stream(
            { tipo: "accion_pantalla", accionPantalla: { control: "listado-9", accion: "filtrar", parametros: {} } },
            fin,
        ));
        renderHook(() => useModoVoz());
        decir("oye olula filtra por Acme");
        await waitFor(() => expect(tts.hablar).toHaveBeenCalledWith("Ese elemento ya no está en pantalla."));
    });
});

describe("[asistente-voz-16] useModoVoz: avisos hablados", () => {
    const llegaComunicacion = async (total: number, asunto: string) => {
        vi.mocked(getComunicaciones).mockResolvedValue({
            datos: [{ asunto } as never], total,
        } as never);
        await act(async () => sse.manejadores.get("comun.comunicacion.resumen")?.({ data: JSON.stringify({ total_no_leidas: total }) }));
    };

    test("dice el asunto de una comunicación nueva", async () => {
        renderHook(() => useModoVoz());
        await waitFor(() => expect(sse.manejadores.has("comun.comunicacion.resumen")).toBe(true));
        await llegaComunicacion(3, "Pedido PED-0012 servido");
        await waitFor(() => expect(tts.hablar).toHaveBeenCalledWith("Tienes un aviso nuevo: Pedido PED 12 servido."));
    });

    test("si no sube el número de no leídas, no dice nada", async () => {
        renderHook(() => useModoVoz());
        await waitFor(() => expect(sse.manejadores.has("comun.comunicacion.resumen")).toBe(true));
        await llegaComunicacion(1, "Algo leído");
        await new Promise(r => setTimeout(r, 20));
        expect(tts.hablar).not.toHaveBeenCalled();
    });

    test("si está ocupado, lo dice al terminar", async () => {
        const s = streamControlado();
        vi.mocked(consultarIaStream).mockImplementation(() => s.generador);
        const { result } = renderHook(() => useModoVoz());
        await waitFor(() => expect(sse.manejadores.has("comun.comunicacion.resumen")).toBe(true));
        decir("oye olula cuántos pedidos");
        await waitFor(() => expect(result.current.estado).toBe("procesando"));

        await llegaComunicacion(3, "Tu consulta ya está lista");
        await new Promise(r => setTimeout(r, 20));
        expect(tts.hablar).not.toHaveBeenCalledWith(expect.stringContaining("Ya tengo"));

        decir("para");
        await waitFor(() => expect(tts.hablar).toHaveBeenCalledWith(
            "Ya tengo la respuesta a tu consulta. La tienes en el chat."));
        await act(async () => s.terminar());
    });

    test("sin el modo voz activo no se suscribe", () => {
        act(() => establecerModoVoz(false));
        sse.manejadores.clear();
        renderHook(() => useModoVoz());
        expect(sse.manejadores.size).toBe(0);
    });
});

describe("[asistente-voz-17] useModoVoz: no se escucha a sí mismo", () => {
    const resultadoFinal = (r: FakeRecognition | undefined, texto: string) => act(() => {
        r?.onresult?.({ resultIndex: 0, results: [Object.assign([{ transcript: texto, confidence: 1 }], { isFinal: true })] });
    });

    test("lo que el reconocedor oyó mientras hablaba y entrega tarde se descarta", async () => {
        let terminarDeHablar = () => {};
        tts.hablar.mockImplementation(() => new Promise<undefined>(r => { terminarDeHablar = () => r(undefined); }));
        const { result } = renderHook(() => useModoVoz());
        decir("oye olula cuántos pedidos tengo");
        await waitFor(() => expect(result.current.estado).toBe("respondiendo"));
        const reconocedorMientrasHabla = activa();

        await act(async () => terminarDeHablar());
        await waitFor(() => expect(result.current.estado).toBe("escuchando_orden"));
        // Se ha empezado una sesión de reconocimiento nueva: la anterior ya no entrega nada.
        expect(activa()).not.toBe(reconocedorMientrasHabla);
        resultadoFinal(reconocedorMientrasHabla, "tienes tres pedidos pendientes");
        await new Promise(r => setTimeout(r, 20));
        expect(consultarIaStream).toHaveBeenCalledTimes(1);
    });

    test("en la ventana de seguimiento, el eco de su respuesta no se toma como orden", async () => {
        const { result } = renderHook(() => useModoVoz());
        decir("oye olula cuántos pedidos tengo");
        await waitFor(() => expect(result.current.estado).toBe("escuchando_orden"));

        decir("tienes 3 pedidos pendientes");
        await new Promise(r => setTimeout(r, 20));
        expect(consultarIaStream).toHaveBeenCalledTimes(1);
        expect(result.current.estado).toBe("escuchando_orden");

        // Una pregunta de verdad sí pasa.
        decir("y cuántos clientes nuevos hay");
        await waitFor(() => expect(consultarIaStream).toHaveBeenCalledTimes(2));
    });

    test("al repreguntar una confirmación, su propio «¿lo confirmo?» no confirma nada", async () => {
        vi.mocked(consultarIaStream).mockImplementation(() => stream({ tipo: "a2ui", a2uiMessage: tarjetaConfirmacion }, fin));
        const { result } = renderHook(() => useModoVoz({ onMostrarHilo: vi.fn() }));
        decir("oye olula crea un pedido para Acme");
        await waitFor(() => expect(result.current.estado).toBe("confirmando"));

        let terminarDeHablar = () => {};
        tts.hablar.mockImplementation(() => new Promise<undefined>(r => { terminarDeHablar = () => r(undefined); }));
        decir("el de ayer");
        await waitFor(() => expect(tts.hablar).toHaveBeenCalledWith("Perdona, no te he entendido. ¿Lo confirmo?"));
        decir("lo confirmo");
        await new Promise(r => setTimeout(r, 20));
        expect(enviarAccionA2ui).not.toHaveBeenCalled();

        await act(async () => terminarDeHablar());
        await waitFor(() => expect(activa()).toBeDefined());
        await new Promise(r => setTimeout(r, 450));
        decir("sí");
        await waitFor(() => expect(enviarAccionA2ui).toHaveBeenCalledWith(
            expect.objectContaining({ context: { value: true } }), "voz-1"));
    });

    test("no vuelve a escuchar hasta un momento después de terminar de hablar", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: false });
        try {
            const { result } = renderHook(() => useModoVoz());
            decir("oye olula hola");
            await act(async () => { await vi.advanceTimersByTimeAsync(0); });
            await act(async () => { await vi.advanceTimersByTimeAsync(100); });
            expect(result.current.estado).toBe("respondiendo");
            await act(async () => { await vi.advanceTimersByTimeAsync(400); });
            expect(result.current.estado).toBe("escuchando_orden");
        } finally {
            vi.useRealTimers();
        }
    });
});

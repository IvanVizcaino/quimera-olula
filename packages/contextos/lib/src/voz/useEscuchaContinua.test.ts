import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useEscuchaContinua } from "./useEscuchaContinua.ts";

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

    emitirResultado(texto: string, final: boolean) {
        const resultado = Object.assign([{ transcript: texto, confidence: 1 }], { isFinal: final });
        this.onresult?.({ resultIndex: 0, results: [resultado] });
    }
}

const ultima = () => FakeRecognition.instancias[FakeRecognition.instancias.length - 1];

beforeEach(() => {
    FakeRecognition.instancias = [];
    vi.useFakeTimers();
    vi.stubGlobal("SpeechRecognition", FakeRecognition);
});

afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
});

describe("[voz-escucha-01] useEscuchaContinua", () => {
    test("no arranca sin soporte del navegador", () => {
        vi.stubGlobal("SpeechRecognition", undefined);
        const { result } = renderHook(() => useEscuchaContinua({ activa: true, onResultado: vi.fn() }));
        expect(result.current.soportado).toBe(false);
        expect(FakeRecognition.instancias).toHaveLength(0);
    });

    test("arranca en modo continuo y entrega resultados provisionales y finales", () => {
        const onResultado = vi.fn();
        renderHook(() => useEscuchaContinua({ activa: true, onResultado }));

        const r = ultima();
        expect(r.continuous).toBe(true);
        expect(r.interimResults).toBe(true);
        expect(r.lang).toBe("es-ES");
        expect(r.start).toHaveBeenCalled();

        act(() => r.emitirResultado(" oye olula ", false));
        act(() => r.emitirResultado("oye olula qué tal", true));
        expect(onResultado).toHaveBeenNthCalledWith(1, { texto: "oye olula", final: false });
        expect(onResultado).toHaveBeenNthCalledWith(2, { texto: "oye olula qué tal", final: true });
    });

    test("rearranca sola cuando el navegador corta la sesión", () => {
        renderHook(() => useEscuchaContinua({ activa: true, onResultado: vi.fn() }));
        act(() => ultima().onend?.());
        act(() => vi.advanceTimersByTime(0));
        expect(FakeRecognition.instancias).toHaveLength(2);
        expect(ultima().start).toHaveBeenCalled();
    });

    test("espera cada vez más entre reintentos si los cortes son por error", () => {
        renderHook(() => useEscuchaContinua({ activa: true, onResultado: vi.fn() }));
        act(() => {
            ultima().onerror?.({ error: "network" });
            ultima().onend?.();
        });
        act(() => vi.advanceTimersByTime(499));
        expect(FakeRecognition.instancias).toHaveLength(1);
        act(() => vi.advanceTimersByTime(1));
        expect(FakeRecognition.instancias).toHaveLength(2);

        act(() => {
            ultima().onerror?.({ error: "network" });
            ultima().onend?.();
        });
        act(() => vi.advanceTimersByTime(999));
        expect(FakeRecognition.instancias).toHaveLength(2);
        act(() => vi.advanceTimersByTime(1));
        expect(FakeRecognition.instancias).toHaveLength(3);
    });

    test("un error fatal (permiso denegado) para y no reintenta hasta llamar a reintentar", () => {
        const { result } = renderHook(() => useEscuchaContinua({ activa: true, onResultado: vi.fn() }));
        act(() => {
            ultima().onerror?.({ error: "not-allowed" });
            ultima().onend?.();
        });
        act(() => vi.advanceTimersByTime(20_000));
        expect(result.current.error).toBe("Permiso de micrófono denegado");
        expect(FakeRecognition.instancias).toHaveLength(1);

        act(() => result.current.reintentar());
        expect(result.current.error).toBeNull();
        expect(FakeRecognition.instancias).toHaveLength(2);
    });

    test("al cambiar la sesión descarta la actual y empieza otra", () => {
        const onResultado = vi.fn();
        const { rerender } = renderHook(
            ({ sesion }) => useEscuchaContinua({ activa: true, onResultado, sesion }),
            { initialProps: { sesion: 0 } },
        );
        const anterior = ultima();
        rerender({ sesion: 1 });
        expect(anterior.abort).toHaveBeenCalled();
        expect(FakeRecognition.instancias).toHaveLength(2);
        // Lo que la sesión anterior entregue tarde ya no llega.
        anterior.emitirResultado("eco", true);
        expect(onResultado).not.toHaveBeenCalled();
    });

    test("deja de escuchar (abort) al desactivarse y no rearranca", () => {
        const { rerender } = renderHook(
            ({ activa }) => useEscuchaContinua({ activa, onResultado: vi.fn() }),
            { initialProps: { activa: true } },
        );
        const r = ultima();
        rerender({ activa: false });
        expect(r.abort).toHaveBeenCalled();
        act(() => vi.advanceTimersByTime(5_000));
        expect(FakeRecognition.instancias).toHaveLength(1);
    });
});

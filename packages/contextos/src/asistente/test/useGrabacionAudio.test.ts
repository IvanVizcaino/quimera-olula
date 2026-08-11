import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { useGrabacionAudio } from "#/asistente/vistas/useGrabacionAudio.ts";

class FakeMediaRecorder {
    state: "inactive" | "recording" = "inactive";
    mimeType = "audio/webm";
    ondataavailable: ((e: { data: Blob }) => void) | null = null;
    onstop: (() => void) | null = null;

    constructor(_stream: MediaStream) {}

    start() {
        this.state = "recording";
    }

    stop() {
        this.state = "inactive";
        this.ondataavailable?.({ data: new Blob(["audio-fake"], { type: this.mimeType }) });
        this.onstop?.();
    }
}

const fakeTrack = { stop: vi.fn() };
const fakeStream = { getTracks: () => [fakeTrack] } as unknown as MediaStream;

describe("[asistente-audio-01] useGrabacionAudio detecta soporte del navegador", () => {
    test("soportado=false si no hay MediaRecorder/getUserMedia", () => {
        const { result } = renderHook(() => useGrabacionAudio());
        expect(result.current.soportado).toBe(false);
    });
});

describe("[asistente-audio-02] useGrabacionAudio graba y produce el audio en base64", () => {
    beforeEach(() => {
        vi.stubGlobal("MediaRecorder", FakeMediaRecorder);
        vi.stubGlobal("navigator", {
            ...navigator,
            mediaDevices: { getUserMedia: vi.fn(async () => fakeStream) },
        });
    });

    test("iniciar() pone grabando=true y detener() devuelve el audio grabado", async () => {
        const { result } = renderHook(() => useGrabacionAudio());
        expect(result.current.soportado).toBe(true);

        await act(async () => {
            await result.current.iniciar();
        });
        expect(result.current.grabando).toBe(true);

        let audio: Awaited<ReturnType<typeof result.current.detener>> = null;
        await act(async () => {
            audio = await result.current.detener();
        });

        await waitFor(() => expect(result.current.grabando).toBe(false));
        expect(audio).not.toBeNull();
        expect(audio!.tipoMime).toBe("audio/webm");
        expect(audio!.datosBase64.length).toBeGreaterThan(0);
        expect(fakeTrack.stop).toHaveBeenCalled();
    });

    test("detener() sin haber grabado devuelve null", async () => {
        const { result } = renderHook(() => useGrabacionAudio());

        const audio = await result.current.detener();

        expect(audio).toBeNull();
    });

    test("cancelar() detiene la grabación sin dejarla en curso", async () => {
        const { result } = renderHook(() => useGrabacionAudio());

        await act(async () => {
            await result.current.iniciar();
        });
        expect(result.current.grabando).toBe(true);

        act(() => {
            result.current.cancelar();
        });

        expect(result.current.grabando).toBe(false);
    });
});

describe("[asistente-audio-03] useGrabacionAudio maneja el permiso de micrófono denegado", () => {
    test("iniciar() deja un mensaje de error si getUserMedia rechaza", async () => {
        vi.stubGlobal("MediaRecorder", FakeMediaRecorder);
        vi.stubGlobal("navigator", {
            ...navigator,
            mediaDevices: {
                getUserMedia: vi.fn(async () => { throw new Error("Permission denied"); }),
            },
        });

        const { result } = renderHook(() => useGrabacionAudio());

        await act(async () => {
            await result.current.iniciar();
        });

        expect(result.current.grabando).toBe(false);
        expect(result.current.error).toBeTruthy();
    });
});

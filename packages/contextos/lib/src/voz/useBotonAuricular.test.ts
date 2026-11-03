import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useBotonAuricular } from "./useBotonAuricular.ts";

const manejadores = new Map<string, (() => void) | null>();
const play = vi.fn(async () => undefined);
const pause = vi.fn();

beforeEach(() => {
    manejadores.clear();
    play.mockClear();
    pause.mockClear();
    vi.stubGlobal("navigator", {
        ...navigator,
        mediaSession: {
            metadata: null,
            playbackState: "none",
            setActionHandler: (accion: string, manejador: (() => void) | null) => manejadores.set(accion, manejador),
        },
    });
    vi.stubGlobal("Audio", vi.fn(() => ({ play, pause, loop: false })));
    vi.stubGlobal("URL", { ...URL, createObjectURL: () => "blob:silencio", revokeObjectURL: vi.fn() });
});

afterEach(() => vi.unstubAllGlobals());

describe("[voz-auricular-01] useBotonAuricular", () => {
    test("inactivo: no toca la sesión multimedia", () => {
        renderHook(() => useBotonAuricular(false, vi.fn()));
        expect(manejadores.size).toBe(0);
        expect(play).not.toHaveBeenCalled();
    });

    test("activo: reproduce silencio y play/pausa del auricular llaman a alPulsar", () => {
        const alPulsar = vi.fn();
        const { unmount } = renderHook(() => useBotonAuricular(true, alPulsar));
        expect(play).toHaveBeenCalled();
        manejadores.get("play")?.();
        manejadores.get("pause")?.();
        expect(alPulsar).toHaveBeenCalledTimes(2);
        expect(navigator.mediaSession.playbackState).toBe("playing");

        unmount();
        expect(manejadores.get("play")).toBeNull();
        expect(pause).toHaveBeenCalled();
    });
});

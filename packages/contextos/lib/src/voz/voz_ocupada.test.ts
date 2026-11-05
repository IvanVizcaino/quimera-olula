import { act, renderHook } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { useFlujoVoz } from "./useFlujoVoz.ts";
import { reservarVoz, useVozOcupada, vozOcupada } from "./voz_ocupada.ts";

describe("[voz-ocupada-01] reserva global de la voz", () => {
    test("ocupada mientras haya alguna reserva; liberar es idempotente", () => {
        const { result } = renderHook(() => useVozOcupada());
        expect(result.current).toBe(false);
        let liberarA = () => {};
        let liberarB = () => {};
        act(() => {
            liberarA = reservarVoz();
            liberarB = reservarVoz();
        });
        expect(result.current).toBe(true);
        act(() => {
            liberarA();
            liberarA();
        });
        expect(result.current).toBe(true);
        act(() => liberarB());
        expect(result.current).toBe(false);
    });

    test("useFlujoVoz reserva la voz al preguntar y la libera al cancelar o desmontar", async () => {
        const pregunta = { instruccion: "Di la caja", tipo: "texto" as const, confirmacion: () => "" };
        const { result, unmount } = renderHook(() => useFlujoVoz());

        // Sin reconocimiento en jsdom la pregunta falla, pero la reserva ya está hecha.
        await act(async () => {
            await result.current.preguntar(pregunta).catch(() => undefined);
        });
        expect(vozOcupada()).toBe(true);
        act(() => result.current.cancelar());
        expect(vozOcupada()).toBe(false);

        await act(async () => {
            await result.current.preguntar(pregunta).catch(() => undefined);
        });
        expect(vozOcupada()).toBe(true);
        unmount();
        expect(vozOcupada()).toBe(false);
    });
});

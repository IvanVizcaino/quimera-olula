import { describe, test, expect, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AUTH_STORAGE_CHANGED_EVENT } from "@olula/lib/api/auth_storage_events.ts";
import { useSesionActiva } from "#/asistente/useSesionActiva.ts";

afterEach(() => {
    localStorage.clear();
});

// ---------------------------------------------------------------------------
// [asistente-sesion-01] useSesionActiva refleja si hay token en localStorage
// ---------------------------------------------------------------------------

describe("[asistente-sesion-01] useSesionActiva refleja si hay token en localStorage", () => {
    test("false si no hay ningún token", () => {
        const { result } = renderHook(() => useSesionActiva());
        expect(result.current).toBe(false);
    });

    test("true si hay token-acceso", () => {
        localStorage.setItem("token-acceso", "abc");
        const { result } = renderHook(() => useSesionActiva());
        expect(result.current).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// [asistente-sesion-02] useSesionActiva reacciona a login/logout sin recargar
// ---------------------------------------------------------------------------

describe("[asistente-sesion-02] useSesionActiva reacciona a AUTH_STORAGE_CHANGED_EVENT", () => {
    test("pasa a true tras un login en la misma pestaña", () => {
        const { result } = renderHook(() => useSesionActiva());
        expect(result.current).toBe(false);

        act(() => {
            localStorage.setItem("token-acceso", "abc");
            window.dispatchEvent(new Event(AUTH_STORAGE_CHANGED_EVENT));
        });

        expect(result.current).toBe(true);
    });

    test("pasa a false tras un logout en la misma pestaña", () => {
        localStorage.setItem("token-acceso", "abc");
        const { result } = renderHook(() => useSesionActiva());
        expect(result.current).toBe(true);

        act(() => {
            localStorage.removeItem("token-acceso");
            window.dispatchEvent(new Event(AUTH_STORAGE_CHANGED_EVENT));
        });

        expect(result.current).toBe(false);
    });
});

import { describe, test, expect } from "vitest";
import {
    PANEL_LATERAL_TOGGLE_EVENT,
    PANEL_LATERAL_ABIERTO_EVENT,
    solicitarTogglePanelLateral,
    notificarPanelLateralAbierto,
} from "../panel_lateral_events.ts";

// ---------------------------------------------------------------------------
// [lib-panel-lateral-01] los helpers disparan el CustomEvent esperado en window
// ---------------------------------------------------------------------------

describe("[lib-panel-lateral-01] los helpers disparan el CustomEvent esperado en window", () => {
    test("solicitarTogglePanelLateral dispara PANEL_LATERAL_TOGGLE_EVENT con el detail dado", () => {
        let recibido: string | undefined;
        const escuchar = (e: Event) => { recibido = (e as CustomEvent<string>).detail; };
        window.addEventListener(PANEL_LATERAL_TOGGLE_EVENT, escuchar);

        solicitarTogglePanelLateral("asistente");

        window.removeEventListener(PANEL_LATERAL_TOGGLE_EVENT, escuchar);
        expect(recibido).toBe("asistente");
    });

    test("notificarPanelLateralAbierto dispara PANEL_LATERAL_ABIERTO_EVENT con el detail dado", () => {
        let recibido: string | undefined;
        const escuchar = (e: Event) => { recibido = (e as CustomEvent<string>).detail; };
        window.addEventListener(PANEL_LATERAL_ABIERTO_EVENT, escuchar);

        notificarPanelLateralAbierto("usuario");

        window.removeEventListener(PANEL_LATERAL_ABIERTO_EVENT, escuchar);
        expect(recibido).toBe("usuario");
    });
});

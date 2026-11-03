import { useSyncExternalStore } from "react";
import { preferencias } from "../preferencias.ts";
import { grabacionSoportada } from "./grabar_frase.ts";
import { reconocimientoContinuoSoportado } from "./useEscuchaContinua.ts";

/**
 * Estado global del "modo voz" del asistente (escucha continua con frase de
 * activación). Lo leen paquetes que no comparten un React Context común — el botón de
 * la cabecera (packages/componentes) y el asistente (packages/contextos) —, así que
 * vive en las preferencias y se notifica por evento de window, igual que
 * panel_lateral_events.ts.
 */

const CLAVE_PREFERENCIA = "asistente.modoVoz";
export const MODO_VOZ_CAMBIO_EVENT = "quimera:modo-voz-cambio";

export const modoVozActivo = (): boolean => preferencias.get(CLAVE_PREFERENCIA, false);

export const establecerModoVoz = (activo: boolean): void => {
    preferencias.set(CLAVE_PREFERENCIA, activo);
    window.dispatchEvent(new CustomEvent<boolean>(MODO_VOZ_CAMBIO_EVENT, { detail: activo }));
};

const suscribir = (avisar: () => void) => {
    window.addEventListener(MODO_VOZ_CAMBIO_EVENT, avisar);
    // Cambios hechos desde otra pestaña de la misma app.
    window.addEventListener("storage", avisar);
    return () => {
        window.removeEventListener(MODO_VOZ_CAMBIO_EVENT, avisar);
        window.removeEventListener("storage", avisar);
    };
};

export const useModoVozActivo = (): [boolean, (activo: boolean) => void] => [
    useSyncExternalStore(suscribir, modoVozActivo, () => false),
    establecerModoVoz,
];

/**
 * Cómo capta el modo voz lo que se dice:
 * - "texto": reconocimiento continuo del navegador (Chrome, Edge, Safari) — frase de
 *   activación, transcripción en vivo e interrupción mientras habla.
 * - "audio": sin reconocimiento (Firefox) — se graba la orden y se manda como audio al
 *   asistente; se activa pulsando (o con un DetectorActivacion local).
 * null si el navegador no puede ni grabar.
 *
 * VITE_ASISTENTE_VOZ_CAPTURA=audio fuerza el modo audio (para probarlo en Chrome).
 */
export type ModoCapturaVoz = "texto" | "audio";

export const modoCapturaVoz = (): ModoCapturaVoz | null => {
    const forzarAudio = import.meta.env.VITE_ASISTENTE_VOZ_CAPTURA === "audio";
    if (!forzarAudio && reconocimientoContinuoSoportado()) return "texto";
    return grabacionSoportada() ? "audio" : null;
};

import { useEffect, useRef } from "react";

/** WAV de silencio (0,5 s, 8 kHz, 8 bits, mono) generado al vuelo — sin ficheros. */
const crearSilencioWav = (): Blob => {
    const muestras = 4000;
    const buffer = new ArrayBuffer(44 + muestras);
    const vista = new DataView(buffer);
    const texto = (desde: number, valor: string) =>
        [...valor].forEach((c, i) => vista.setUint8(desde + i, c.charCodeAt(0)));
    texto(0, "RIFF");
    vista.setUint32(4, 36 + muestras, true);
    texto(8, "WAVE");
    texto(12, "fmt ");
    vista.setUint32(16, 16, true);
    vista.setUint16(20, 1, true); // PCM
    vista.setUint16(22, 1, true); // mono
    vista.setUint32(24, 8000, true);
    vista.setUint32(28, 8000, true);
    vista.setUint16(32, 1, true);
    vista.setUint16(34, 8, true);
    texto(36, "data");
    vista.setUint32(40, muestras, true);
    for (let i = 0; i < muestras; i++) vista.setUint8(44 + i, 128); // 128 = silencio en 8 bits
    return new Blob([buffer], { type: "audio/wav" });
};

const ACCIONES: MediaSessionAction[] = ["play", "pause", "stop", "nexttrack", "previoustrack"];

export const botonAuricularSoportado = (): boolean =>
    typeof navigator !== "undefined" && "mediaSession" in navigator && typeof Audio !== "undefined";

/**
 * Botón multimedia del auricular (play/pausa, Bluetooth o con cable) como "pulsar
 * para hablar" — con las manos ocupadas (almacén) es más cómodo que decir la frase.
 *
 * El navegador solo entrega esos botones a una página que esté reproduciendo audio,
 * así que mientras está activo se reproduce un audio silencioso en bucle (en Android
 * eso muestra un control multimedia en las notificaciones). Experimental: el
 * comportamiento varía según dispositivo y auricular.
 */
export const useBotonAuricular = (activo: boolean, alPulsar: () => void): void => {
    const alPulsarRef = useRef(alPulsar);
    useEffect(() => {
        alPulsarRef.current = alPulsar;
    });

    useEffect(() => {
        if (!activo || !botonAuricularSoportado()) return;
        const url = URL.createObjectURL(crearSilencioWav());
        const audio = new Audio(url);
        audio.loop = true;
        const reproducir = () => void audio.play().catch(() => undefined);
        reproducir();

        const sesion = navigator.mediaSession;
        if (typeof MediaMetadata !== "undefined") {
            sesion.metadata = new MediaMetadata({ title: "Asistente", artist: "Modo voz activo" });
        }
        sesion.playbackState = "playing";
        for (const accion of ACCIONES) {
            try {
                sesion.setActionHandler(accion, () => {
                    alPulsarRef.current();
                    // Que la pulsación no deje la sesión en pausa (dejaría de recibir botones).
                    sesion.playbackState = "playing";
                    reproducir();
                });
            } catch {
                // Acción no soportada por este navegador.
            }
        }

        return () => {
            for (const accion of ACCIONES) {
                try {
                    sesion.setActionHandler(accion, null);
                } catch {
                    // idem
                }
            }
            sesion.playbackState = "none";
            audio.pause();
            URL.revokeObjectURL(url);
        };
    }, [activo]);
};

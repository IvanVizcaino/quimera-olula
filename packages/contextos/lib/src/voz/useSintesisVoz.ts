import { useCallback, useEffect, useRef, useState } from "react";

const soportado =
    typeof window !== "undefined" && "speechSynthesis" in window;

const obtenerVozEspañola = (): SpeechSynthesisVoice | null => {
    const voces = window.speechSynthesis.getVoices();
    return (
        voces.find((v) => v.lang === "es-ES") ??
        voces.find((v) => v.lang.startsWith("es")) ??
        null
    );
};

/**
 * Desbloquea speechSynthesis reproducing un utterance vacío.
 * Debe llamarse desde un evento de usuario (click) para que
 * Chromium/Chrome permita TTS posterior sin gesto.
 */
export const desbloquearTTS = () => {
    if (!soportado) return;
    const u = new SpeechSynthesisUtterance("");
    u.volume = 0;
    window.speechSynthesis.speak(u);
};

export interface UseSintesisVoz {
    soportado: boolean;
    hablando: boolean;
    vocesDisponibles: boolean;
    hablar: (texto: string) => Promise<void>;
    detener: () => void;
}

export const useSintesisVoz = (): UseSintesisVoz => {
    const [hablando, setHablando] = useState(false);
    const [vocesDisponibles, setVocesDisponibles] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        if (!soportado) return;

        const actualizarVoces = () => {
            const voces = window.speechSynthesis.getVoices();
            setVocesDisponibles(voces.length > 0);
        };

        // Pre-cargar voces (en Chromium se cargan de forma asíncrona)
        actualizarVoces();
        window.speechSynthesis.onvoiceschanged = actualizarVoces;

        return () => {
            window.speechSynthesis?.cancel();
        };
    }, []);

    const hablar = useCallback(
        (texto: string): Promise<void> =>
            new Promise((resolve, reject) => {
                if (!soportado) {
                    resolve();
                    return;
                }

                window.speechSynthesis.cancel();

                // Pequeño retardo tras cancel() para evitar bug de Chrome
                // donde speak() inmediatamente después de cancel() se ignora
                setTimeout(() => {
                    const utterance = new SpeechSynthesisUtterance(texto);
                    utterance.lang = "es-ES";
                    utterance.rate = 1.1;
                    utterance.pitch = 1;

                    const voz = obtenerVozEspañola();
                    if (voz) utterance.voice = voz;

                    utterance.onstart = () => setHablando(true);
                    utterance.onend = () => {
                        setHablando(false);
                        resolve();
                    };
                    utterance.onerror = (event) => {
                        setHablando(false);
                        if (event.error === "canceled" || event.error === "interrupted") {
                            resolve();
                        } else {
                            reject(new Error(`TTS error: ${event.error}`));
                        }
                    };

                    utteranceRef.current = utterance;
                    window.speechSynthesis.speak(utterance);
                }, 50);
            }),
        []
    );

    const detener = useCallback(() => {
        window.speechSynthesis?.cancel();
        setHablando(false);
    }, []);

    return { soportado, hablando, vocesDisponibles, hablar, detener };
};

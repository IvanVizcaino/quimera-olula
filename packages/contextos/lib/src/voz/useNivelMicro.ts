import { RefObject, useEffect } from "react";

const SUAVIZADO = 0.75;
const GANANCIA = 4;

/**
 * Nivel de entrada del micrófono (0..1), escrito como propiedad CSS (`--nivel-micro`
 * por defecto) en el elemento indicado — para animaciones que reaccionan a la voz.
 *
 * La Web Speech API no expone el audio que oye, así que se abre un `getUserMedia`
 * aparte solo para medir. Se escribe directamente en el estilo (sin estado React) para
 * no provocar un render por fotograma.
 */
export const useNivelMicro = (
    activo: boolean,
    elementoRef: RefObject<HTMLElement | null>,
    propiedad = "--nivel-micro",
): void => {
    useEffect(() => {
        if (!activo || typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return;
        if (typeof AudioContext === "undefined") return;

        const elemento = elementoRef.current;
        let cancelado = false;
        let stream: MediaStream | null = null;
        let contexto: AudioContext | null = null;
        let fotograma = 0;
        let nivel = 0;

        // Sin un gesto previo del usuario el AudioContext nace suspendido (mediría
        // silencio): se reanuda en la primera interacción.
        const reanudar = () => void contexto?.resume();

        navigator.mediaDevices
            .getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
            .then(s => {
                if (cancelado) {
                    s.getTracks().forEach(pista => pista.stop());
                    return;
                }
                stream = s;
                contexto = new AudioContext();
                void contexto.resume().catch(() => undefined);
                document.addEventListener("pointerdown", reanudar);
                document.addEventListener("keydown", reanudar);

                const analizador = contexto.createAnalyser();
                analizador.fftSize = 512;
                contexto.createMediaStreamSource(s).connect(analizador);
                const muestras = new Uint8Array(analizador.fftSize);

                const medir = () => {
                    analizador.getByteTimeDomainData(muestras);
                    let suma = 0;
                    for (const muestra of muestras) {
                        const x = (muestra - 128) / 128;
                        suma += x * x;
                    }
                    const instantaneo = Math.min(1, Math.sqrt(suma / muestras.length) * GANANCIA);
                    nivel = nivel * SUAVIZADO + instantaneo * (1 - SUAVIZADO);
                    elemento?.style.setProperty(propiedad, nivel.toFixed(3));
                    fotograma = requestAnimationFrame(medir);
                };
                medir();
            })
            .catch(() => undefined);

        return () => {
            cancelado = true;
            cancelAnimationFrame(fotograma);
            document.removeEventListener("pointerdown", reanudar);
            document.removeEventListener("keydown", reanudar);
            stream?.getTracks().forEach(pista => pista.stop());
            void contexto?.close().catch(() => undefined);
            elemento?.style.removeProperty(propiedad);
        };
    }, [activo, elementoRef, propiedad]);
};

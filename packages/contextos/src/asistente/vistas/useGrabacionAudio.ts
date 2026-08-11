import { useCallback, useRef, useState } from "react";

export interface AudioGrabado {
    datosBase64: string;
    tipoMime: string;
}

interface UseGrabacionAudio {
    /** false si el navegador no soporta MediaRecorder/getUserMedia (Safari antiguo,
     * contexto no seguro sin HTTPS) — degradación silenciosa, el botón de micro no debe
     * mostrarse en ese caso. */
    soportado: boolean;
    grabando: boolean;
    error: string | null;
    iniciar: () => Promise<void>;
    /** Para la grabación y devuelve el audio en base64 — null si no había nada grabado. */
    detener: () => Promise<AudioGrabado | null>;
    /** Aborta una grabación en curso sin producir ningún resultado. */
    cancelar: () => void;
}

const soportaGrabacion = (): boolean =>
    typeof navigator !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== "undefined";

const blobABase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
        const lector = new FileReader();
        lector.onloadend = () => {
            const resultado = lector.result as string;
            // recorta el prefijo "data:<mime>;base64," — solo interesa el contenido
            resolve(resultado.slice(resultado.indexOf(",") + 1));
        };
        lector.onerror = () => reject(lector.error);
        lector.readAsDataURL(blob);
    });

export function useGrabacionAudio(): UseGrabacionAudio {
    const [grabando, setGrabando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);

    const soportado = soportaGrabacion();

    const liberarMicrofono = useCallback(() => {
        streamRef.current?.getTracks().forEach(pista => pista.stop());
        streamRef.current = null;
    }, []);

    const iniciar = useCallback(async () => {
        if (!soportado) return;
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            chunksRef.current = [];

            const recorder = new MediaRecorder(stream);
            recorder.ondataavailable = evento => {
                if (evento.data.size > 0) chunksRef.current.push(evento.data);
            };
            mediaRecorderRef.current = recorder;
            recorder.start();
            setGrabando(true);
        } catch {
            setError("No se pudo acceder al micrófono.");
            liberarMicrofono();
        }
    }, [soportado, liberarMicrofono]);

    const detener = useCallback((): Promise<AudioGrabado | null> => {
        return new Promise(resolve => {
            const recorder = mediaRecorderRef.current;
            if (!recorder || recorder.state === "inactive") {
                resolve(null);
                return;
            }
            recorder.onstop = async () => {
                liberarMicrofono();
                setGrabando(false);
                const tipoMime = recorder.mimeType || "audio/webm";
                const blob = new Blob(chunksRef.current, { type: tipoMime });
                chunksRef.current = [];
                resolve(blob.size > 0 ? { datosBase64: await blobABase64(blob), tipoMime } : null);
            };
            recorder.stop();
        });
    }, [liberarMicrofono]);

    const cancelar = useCallback(() => {
        const recorder = mediaRecorderRef.current;
        if (recorder && recorder.state !== "inactive") {
            recorder.onstop = null;
            recorder.stop();
        }
        chunksRef.current = [];
        liberarMicrofono();
        setGrabando(false);
    }, [liberarMicrofono]);

    return { soportado, grabando, error, iniciar, detener, cancelar };
}

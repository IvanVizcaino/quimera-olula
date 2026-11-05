export type Tono = "activacion" | "cancelacion";

// Frecuencias (Hz) de cada nota: subida = "te escucho", bajada = "cancelado".
const NOTAS: Record<Tono, number[]> = {
    activacion: [660, 990],
    cancelacion: [520, 390],
};

const DURACION_NOTA_S = 0.09;

/** Tono corto generado con WebAudio (sin ficheros de audio). Si el navegador no lo
 * permite (AudioContext bloqueado sin gesto previo), no suena y ya está. */
export const reproducirTono = (tono: Tono): void => {
    if (typeof AudioContext === "undefined") return;
    try {
        const contexto = new AudioContext();
        const inicio = contexto.currentTime;
        NOTAS[tono].forEach((frecuencia, i) => {
            const oscilador = contexto.createOscillator();
            const volumen = contexto.createGain();
            oscilador.type = "sine";
            oscilador.frequency.value = frecuencia;
            const t = inicio + i * DURACION_NOTA_S;
            volumen.gain.setValueAtTime(0.0001, t);
            volumen.gain.exponentialRampToValueAtTime(0.15, t + 0.01);
            volumen.gain.exponentialRampToValueAtTime(0.0001, t + DURACION_NOTA_S);
            oscilador.connect(volumen).connect(contexto.destination);
            oscilador.start(t);
            oscilador.stop(t + DURACION_NOTA_S);
        });
        setTimeout(() => void contexto.close().catch(() => undefined),
            (NOTAS[tono].length * DURACION_NOTA_S + 0.1) * 1000);
    } catch {
        // Sin audio: el aviso visual del orbe sigue funcionando.
    }
};

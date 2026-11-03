export interface AudioGrabado {
    datosBase64: string;
    tipoMime: string;
}

/** Se puede grabar audio y medir su nivel (MediaRecorder + WebAudio) — lo tienen
 * también los navegadores sin reconocimiento de voz (Firefox). */
export const grabacionSoportada = (): boolean =>
    typeof navigator !== "undefined"
    && Boolean(navigator.mediaDevices?.getUserMedia)
    && typeof MediaRecorder !== "undefined"
    && typeof AudioContext !== "undefined";

// ---------------------------------------------------------------------------
// Detección de voz por nivel (VAD): cuándo empieza y cuándo termina la frase
// ---------------------------------------------------------------------------

export interface OpcionesVad {
    /** Si no se habla en este tiempo, no hay frase. */
    esperaInicioMs: number;
    /** Silencio tras haber hablado que da la frase por terminada. */
    silencioFinMs: number;
    /** Duración máxima de la frase. */
    maxMs: number;
    /** Tiempo inicial para medir el ruido de fondo. */
    calibracionMs: number;
    /** Límites del umbral de voz (nivel RMS 0..1), que es el ruido de fondo × factorRuido. */
    umbralMinimo: number;
    umbralMaximo: number;
    factorRuido: number;
}

export const VAD_POR_DEFECTO: OpcionesVad = {
    esperaInicioMs: 6_000,
    silencioFinMs: 1_200,
    maxMs: 15_000,
    calibracionMs: 300,
    umbralMinimo: 0.02,
    umbralMaximo: 0.08,
    factorRuido: 3,
};

export interface EstadoVad {
    inicio: number;
    ruido: number;
    muestrasRuido: number;
    hablado: boolean;
    ultimaVoz: number;
}

/** "fin": frase completa; "sin_voz": no se ha dicho nada. */
export type DecisionVad = "seguir" | "fin" | "sin_voz";

export const iniciarVad = (ahora: number): EstadoVad =>
    ({ inicio: ahora, ruido: 0, muestrasRuido: 0, hablado: false, ultimaVoz: ahora });

/** Un paso de la detección con el nivel medido ahora. Pura: el bucle de medida vive
 * en grabarFrase. */
export const evaluarVad = (
    estado: EstadoVad, nivel: number, ahora: number, opciones: OpcionesVad = VAD_POR_DEFECTO,
): { estado: EstadoVad; decision: DecisionVad } => {
    const transcurrido = ahora - estado.inicio;
    if (transcurrido < opciones.calibracionMs) {
        const muestrasRuido = estado.muestrasRuido + 1;
        const ruido = estado.ruido + (nivel - estado.ruido) / muestrasRuido;
        return { estado: { ...estado, ruido, muestrasRuido }, decision: "seguir" };
    }

    const umbral = Math.min(opciones.umbralMaximo, Math.max(opciones.umbralMinimo, estado.ruido * opciones.factorRuido));
    const siguiente = nivel >= umbral ? { ...estado, hablado: true, ultimaVoz: ahora } : estado;

    if (transcurrido >= opciones.maxMs) return { estado: siguiente, decision: siguiente.hablado ? "fin" : "sin_voz" };
    if (!siguiente.hablado && transcurrido >= opciones.esperaInicioMs) return { estado: siguiente, decision: "sin_voz" };
    if (siguiente.hablado && ahora - siguiente.ultimaVoz >= opciones.silencioFinMs) {
        return { estado: siguiente, decision: "fin" };
    }
    return { estado: siguiente, decision: "seguir" };
};

// ---------------------------------------------------------------------------
// Grabación de una frase
// ---------------------------------------------------------------------------

const INTERVALO_MEDIDA_MS = 50;

const blobABase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
        const lector = new FileReader();
        lector.onloadend = () => {
            const resultado = lector.result as string;
            resolve(resultado.slice(resultado.indexOf(",") + 1));
        };
        lector.onerror = () => reject(lector.error);
        lector.readAsDataURL(blob);
    });

export interface OpcionesGrabarFrase extends Partial<OpcionesVad> {
    signal?: AbortSignal;
    /** Nivel RMS (0..1) de cada medida — para animaciones. */
    onNivel?: (nivel: number) => void;
}

/**
 * Graba UNA frase: empieza a grabar ya y para sola cuando, tras hablar, hay un
 * silencio (o se llega al máximo). null si no se ha dicho nada, si se cancela con
 * `signal`, o si no hay audio. Lanza si no se puede abrir el micrófono.
 */
export async function grabarFrase(opciones: OpcionesGrabarFrase = {}): Promise<AudioGrabado | null> {
    const { signal, onNivel, ...vad } = opciones;
    const parametros: OpcionesVad = { ...VAD_POR_DEFECTO, ...vad };
    if (signal?.aborted) return null;

    const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
    });
    const contexto = new AudioContext();
    void contexto.resume().catch(() => undefined);
    const analizador = contexto.createAnalyser();
    analizador.fftSize = 1024;
    contexto.createMediaStreamSource(stream).connect(analizador);
    const muestras = new Float32Array(analizador.fftSize);

    const recorder = new MediaRecorder(stream);
    const trozos: Blob[] = [];
    recorder.ondataavailable = evento => {
        if (evento.data.size > 0) trozos.push(evento.data);
    };
    recorder.start();

    const decision = await new Promise<DecisionVad | "cancelado">(resolve => {
        let estado = iniciarVad(performance.now());
        const terminar = (resultado: DecisionVad | "cancelado") => {
            clearInterval(intervalo);
            signal?.removeEventListener("abort", alAbortar);
            resolve(resultado);
        };
        const alAbortar = () => terminar("cancelado");

        const intervalo = setInterval(() => {
            analizador.getFloatTimeDomainData(muestras);
            let suma = 0;
            for (const muestra of muestras) suma += muestra * muestra;
            const nivel = Math.sqrt(suma / muestras.length);
            onNivel?.(nivel);
            const paso = evaluarVad(estado, nivel, performance.now(), parametros);
            estado = paso.estado;
            if (paso.decision !== "seguir") terminar(paso.decision);
        }, INTERVALO_MEDIDA_MS);
        signal?.addEventListener("abort", alAbortar, { once: true });
    });

    const blob = await new Promise<Blob>(resolve => {
        recorder.onstop = () => resolve(new Blob(trozos, { type: recorder.mimeType || "audio/webm" }));
        recorder.stop();
    });
    stream.getTracks().forEach(pista => pista.stop());
    void contexto.close().catch(() => undefined);
    onNivel?.(0);

    if (decision !== "fin" || blob.size === 0) return null;
    return { datosBase64: await blobABase64(blob), tipoMime: blob.type || "audio/webm" };
}

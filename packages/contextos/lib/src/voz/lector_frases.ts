/** Fin de frase: puntuación de cierre (con comillas/paréntesis detrás) seguida de
 * espacio, o salto de línea. "1.500" o "3.5" no cortan (no hay espacio tras el punto). */
const FIN_FRASE = /[.!?…:;]+["»”')\]]*\s+|\n+/g;

/**
 * Separa las frases ya completas de un texto que sigue llegando por trozos (streaming).
 * `resto` es lo que aún no se puede leer: la frase a medias (y, si la última completa
 * era muy corta, también esa — se junta con la siguiente para no leer a trompicones).
 */
export const separarFrases = (texto: string, minimo = 20): { frases: string[]; resto: string } => {
    const frases: string[] = [];
    let inicio = 0;
    let pendiente = "";
    for (const coincidencia of texto.matchAll(FIN_FRASE)) {
        const fin = (coincidencia.index ?? 0) + coincidencia[0].length;
        const frase = texto.slice(inicio, fin).trim();
        inicio = fin;
        if (!frase) continue;
        pendiente = pendiente ? `${pendiente} ${frase}` : frase;
        if (pendiente.length >= minimo) {
            frases.push(pendiente);
            pendiente = "";
        }
    }
    const cola = texto.slice(inicio);
    return { frases, resto: pendiente ? `${pendiente} ${cola}` : cola };
};

export interface LectorFrases {
    /** Encola una frase; se lee en cuanto terminen las anteriores. */
    añadir: (frase: string) => void;
    /** Se resuelve cuando se ha leído todo lo encolado (o se ha cancelado). */
    terminar: () => Promise<void>;
    /** Descarta lo pendiente (la frase en curso la corta quien llame a detener el TTS). */
    cancelar: () => void;
    /** Todo lo encolado hasta ahora, leído o no — p. ej. para reconocer el eco. */
    texto: () => string;
}

/**
 * Cola de lectura en voz alta por frases: permite empezar a hablar con la primera
 * frase de una respuesta mientras el resto sigue llegando.
 */
export const crearLectorFrases = (
    hablar: (texto: string) => Promise<void>,
    onEmpieza?: () => void,
): LectorFrases => {
    const cola: string[] = [];
    let cancelado = false;
    let empezado = false;
    let leyendo: Promise<void> | null = null;
    let todo = "";

    const leer = async () => {
        while (cola.length && !cancelado) {
            const frase = cola.shift() as string;
            if (!empezado) {
                empezado = true;
                onEmpieza?.();
            }
            try {
                await hablar(frase);
            } catch {
                // TTS no disponible (p. ej. bloqueado sin interacción previa): se sigue
                // con la cola — el texto también se muestra en pantalla.
            }
        }
        leyendo = null;
    };

    return {
        añadir: frase => {
            const limpia = frase.trim();
            if (cancelado || !limpia) return;
            cola.push(limpia);
            todo = todo ? `${todo} ${limpia}` : limpia;
            if (!leyendo) leyendo = leer();
        },
        terminar: async () => {
            while (leyendo) await leyendo;
        },
        cancelar: () => {
            cancelado = true;
            cola.length = 0;
        },
        texto: () => todo,
    };
};

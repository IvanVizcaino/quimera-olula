import { describe, expect, test } from "vitest";
import { evaluarVad, iniciarVad, VAD_POR_DEFECTO, type DecisionVad, type EstadoVad } from "./grabar_frase.ts";

/** Pasa una secuencia de niveles (uno cada 50 ms) por el VAD y devuelve la decisión
 * final y en qué instante se tomó. */
const simular = (niveles: number[]): { decision: DecisionVad; ms: number } => {
    let estado: EstadoVad = iniciarVad(0);
    for (let i = 0; i < niveles.length; i++) {
        const ms = (i + 1) * 50;
        const paso = evaluarVad(estado, niveles[i], ms);
        estado = paso.estado;
        if (paso.decision !== "seguir") return { decision: paso.decision, ms };
    }
    return { decision: "seguir", ms: niveles.length * 50 };
};

const repetir = (nivel: number, ms: number) => Array(ms / 50).fill(nivel);

describe("[voz-vad-01] evaluarVad", () => {
    test("frase normal: termina tras el silencio posterior", () => {
        const r = simular([...repetir(0.005, 500), ...repetir(0.15, 1500), ...repetir(0.005, 2000)]);
        expect(r.decision).toBe("fin");
        expect(r.ms).toBe(500 + 1500 + VAD_POR_DEFECTO.silencioFinMs);
    });

    test("si no se habla, sin_voz al acabar la espera", () => {
        const r = simular(repetir(0.005, 7000));
        expect(r).toEqual({ decision: "sin_voz", ms: VAD_POR_DEFECTO.esperaInicioMs });
    });

    test("pausas cortas no cortan la frase", () => {
        const r = simular([
            ...repetir(0.005, 400), ...repetir(0.15, 800), ...repetir(0.005, 800),
            ...repetir(0.15, 800), ...repetir(0.005, 1300),
        ]);
        expect(r).toEqual({ decision: "fin", ms: 400 + 800 + 800 + 800 + 1200 });
    });

    test("el umbral se adapta al ruido de fondo", () => {
        // Con ruido de 0.03 el umbral sube a 0.08 (tope): 0.06 ya no cuenta como voz.
        expect(simular([...repetir(0.03, 300), ...repetir(0.06, 6000)]).decision).toBe("sin_voz");
        // En silencio, 0.06 sí es voz.
        expect(simular([...repetir(0.005, 300), ...repetir(0.06, 600), ...repetir(0.005, 1200)]).decision)
            .toBe("fin");
    });

    test("se corta al llegar al máximo aunque se siga hablando", () => {
        expect(simular(repetir(0.15, 20_000))).toEqual({ decision: "fin", ms: VAD_POR_DEFECTO.maxMs });
    });
});

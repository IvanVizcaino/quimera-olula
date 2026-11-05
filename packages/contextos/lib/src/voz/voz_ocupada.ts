import { useSyncExternalStore } from "react";

/**
 * Reserva global del micro y la voz de la página. Solo puede haber un reconocedor de
 * voz activo a la vez y todos comparten `speechSynthesis` (un cancel() de uno corta al
 * otro), así que un flujo de voz propio de una pantalla (p. ej. las lecturas por voz de
 * almacén, useFlujoVoz) reserva la voz mientras dura, y el modo voz del asistente se
 * pone en pausa hasta que la libera.
 */

const reservas = new Set<symbol>();
const oyentes = new Set<() => void>();

const avisar = () => oyentes.forEach(oyente => oyente());

/** Reserva la voz; devuelve la función para liberarla (idempotente). */
export const reservarVoz = (): (() => void) => {
    const reserva = Symbol("reserva-voz");
    reservas.add(reserva);
    avisar();
    return () => {
        if (reservas.delete(reserva)) avisar();
    };
};

export const vozOcupada = (): boolean => reservas.size > 0;

const suscribir = (oyente: () => void) => {
    oyentes.add(oyente);
    return () => oyentes.delete(oyente);
};

export const useVozOcupada = (): boolean => useSyncExternalStore(suscribir, vozOcupada, () => false);

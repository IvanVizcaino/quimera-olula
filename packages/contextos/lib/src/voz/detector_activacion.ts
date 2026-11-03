/**
 * Motor local de palabra de activación ("Oye Olula") para navegadores sin
 * reconocimiento de voz continuo (Firefox): detecta la frase en el propio navegador,
 * sin enviar audio a ningún sitio, y avisa para empezar a grabar la orden.
 *
 * Ninguno viene incluido (dependen de un modelo/licencia externos — Porcupine, Vosk…).
 * Una app lo activa registrando una implementación en su factory:
 * `FactoryObj.app.Asistente.asistente_DetectorActivacion`. Sin él, en esos navegadores
 * el modo voz funciona pulsando para hablar.
 */
export interface DetectorActivacion {
    /** Empieza a escuchar y llama a `onActivacion` cada vez que oye la frase.
     * Devuelve la función para parar (y liberar el micrófono). */
    escuchar: (onActivacion: () => void) => Promise<() => void>;
}

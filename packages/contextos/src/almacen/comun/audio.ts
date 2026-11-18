import { desbloquearTTS } from "@olula/lib/voz/useSintesisVoz.ts";

export const pitidoError = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance("error");
    u.lang = "es-ES";
    u.volume = 1;
    u.rate = 1.5;
    u.pitch = 0.5;
    window.speechSynthesis.speak(u);
};

// Llamar desde el click que abre un lector para desbloquear speechSynthesis:
// en Chromium basta con hablar una vez desde un gesto del usuario.
export const iniciarAudioLectura = () => {
    desbloquearTTS();
};

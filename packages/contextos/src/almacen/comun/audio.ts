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

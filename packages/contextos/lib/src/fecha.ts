export const fechaActual = () => {
    const ahora = new Date();
    const ms = Date.now();
    const tz = ahora.getTimezoneOffset() * 60_000;

    return new Date(ms - tz).toISOString().slice(0, -5);
};

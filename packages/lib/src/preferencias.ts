const CLAVE = "quimera-preferencias";

const leer = (): Record<string, unknown> => {
    const raw = localStorage.getItem(CLAVE);
    if (!raw) return {};
    try { return JSON.parse(raw) as Record<string, unknown>; } catch { return {}; }
};

export const preferencias = {
    get: <T>(clave: string, porDefecto: T): T => {
        const valor = leer()[clave];
        return valor !== undefined ? (valor as T) : porDefecto;
    },
    set: <T>(clave: string, valor: T): void => {
        localStorage.setItem(CLAVE, JSON.stringify({ ...leer(), [clave]: valor }));
    },
};

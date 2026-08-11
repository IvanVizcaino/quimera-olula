import { notifyAuthStorageChanged } from "./auth_storage_events.ts";

const MINUTOS_REFRESCO = 15;
const MINUTOS = 60 * 1000;

export const tokenAcceso = {
    actualizar: (tokenAcceso: string) => {
        const now = Date.now();
        const fechaRefresco = now + MINUTOS_REFRESCO * MINUTOS;

        localStorage.setItem("token-acceso", tokenAcceso);
        localStorage.setItem("fecha-refresco", fechaRefresco.toString());
        notifyAuthStorageChanged();
    },
    obtener: () => localStorage.getItem("token-acceso"),
    validez: () => {
        const fecha = localStorage.getItem("fecha-refresco");
        if (!fecha) return 0;

        const fechaRefresco = parseInt(fecha);
        if (isNaN(fechaRefresco)) return 0;

        const now = Date.now();
        const validez_minutos = (fechaRefresco - now) / MINUTOS;

        return validez_minutos;
    },
    eliminar: () => {
        localStorage.removeItem("fecha-refresco");
        localStorage.removeItem("token-acceso");
        notifyAuthStorageChanged();
    },
}
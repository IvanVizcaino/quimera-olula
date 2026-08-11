import { useEffect, useState } from "react";
import { estaAutentificado } from "@olula/componentes/plantilla/autenticacion.ts";
import { AUTH_STORAGE_CHANGED_EVENT, AUTH_STORAGE_KEYS } from "@olula/lib/api/auth_storage_events.ts";

/** Reactivo a login/logout (misma pestaña vía AUTH_STORAGE_CHANGED_EVENT, otras pestañas
 * vía el evento nativo "storage") sin necesidad de recargar la página. */
export const useSesionActiva = (): boolean => {
    const [activa, setActiva] = useState(estaAutentificado());

    useEffect(() => {
        const sincronizar = () => setActiva(estaAutentificado());
        const alCambiarStorage = (e: StorageEvent) => {
            if (!e.key || AUTH_STORAGE_KEYS.includes(e.key as (typeof AUTH_STORAGE_KEYS)[number])) sincronizar();
        };
        window.addEventListener("storage", alCambiarStorage);
        window.addEventListener(AUTH_STORAGE_CHANGED_EVENT, sincronizar);
        return () => {
            window.removeEventListener("storage", alCambiarStorage);
            window.removeEventListener(AUTH_STORAGE_CHANGED_EVENT, sincronizar);
        };
    }, []);

    return activa;
};

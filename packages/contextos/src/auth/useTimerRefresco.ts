import { useEffect, useRef } from "react";
// import { redirect } from "react-router";
import { comprobarToken } from "./login/dominio.ts";

/** Páginas sin sesión: si se está en una, no se manda a /login aunque no haya token. */
const RUTAS_PUBLICAS = ["/login", "/auth/passkey/enlace-magico", "/auth/reset-password"];

const esPublica = (ruta: string, extra: string[]) =>
    [...RUTAS_PUBLICAS, ...extra].some((p) => ruta === p || ruta.startsWith(`${p}/`));

export const useTimerRefresco = ({ segundos_refresco = 60, rutasPublicas = [] }: {
    segundos_refresco?: number;
    /** Páginas públicas propias de la app (p. ej. la landing y el registro del SaaS). */
    rutasPublicas?: string[];
} = {}) => {
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        timerRef.current = setInterval(async () => {
            await comprobarToken().catch((_e) => {
                if (!esPublica(window.location.pathname, rutasPublicas)) window.location.href = "/login";
            })
        }, segundos_refresco * 1000);

        return () => {
            clearInterval(timerRef.current!);
        }
    }, [segundos_refresco, rutasPublicas])
};
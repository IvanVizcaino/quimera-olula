import { useEffect, useRef } from "react";
// import { redirect } from "react-router";
import { comprobarToken } from "./login/dominio.ts";

export const useTimerRefresco = ({ segundos_refresco = 60 }: { segundos_refresco?: number } = {}) => {
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        timerRef.current = setInterval(async () => {
            await comprobarToken().catch((_e) => {
                if (window.location.pathname !== "/login") window.location.href = "/login";
            })
        }, segundos_refresco * 1000);

        return () => {
            clearInterval(timerRef.current!);
        }
    }, [segundos_refresco])
};
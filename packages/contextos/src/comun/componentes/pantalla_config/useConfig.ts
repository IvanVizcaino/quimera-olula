import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext, useEffect, useState } from "react";

/**
 * Carga y guardado de una configuración de área (una sola fila en bd): guarda la
 * copia leída para saber si hay cambios y solo la sustituye cuando el servidor
 * acepta el guardado.
 */
export const useConfig = <T extends object>(
    leer: () => Promise<T>,
    guardarEnApi: (config: T) => Promise<void>,
) => {
    const { intentar } = useContext(ContextoError);
    const [guardada, setGuardada] = useState<T | null>(null);
    const [config, setConfig] = useState<T | null>(null);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        intentar(async () => {
            const leida = await leer();
            setGuardada(leida);
            setConfig(leida);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cambiada = !!config && !!guardada
        && JSON.stringify(config) !== JSON.stringify(guardada);

    const cambiar = <K extends keyof T>(campo: K, valor: T[K]) =>
        config && setConfig({ ...config, [campo]: valor });

    const guardar = async () => {
        if (!config) return;
        setGuardando(true);
        await intentar(async () => {
            await guardarEnApi(config);
            setGuardada(config);
        });
        setGuardando(false);
    };

    return { config, cambiar, cambiada, guardando, guardar };
};

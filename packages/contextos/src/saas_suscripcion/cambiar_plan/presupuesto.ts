import { useEffect, useState } from "react";
import { Objetivo, Presupuesto } from "../diseño.ts";
import { claveObjetivo } from "../dominio.ts";
import { postPresupuesto } from "../infraestructura.ts";

export interface EstadoPresupuesto {
    presupuesto: Presupuesto | null;
    calculando: boolean;
    /** Mensaje de la API cuando la combinación no es válida (400). */
    error: string;
}

const SIN_PRESUPUESTO: EstadoPresupuesto = { presupuesto: null, calculando: false, error: "" };

/**
 * Pide el presupuesto del objetivo con debounce. No usa el modal de error global: un 400
 * ("TPV necesita Almacén") es una respuesta normal mientras el usuario va marcando casillas.
 */
export const usePresupuesto = (objetivo: Objetivo, activo: boolean, retardoMs = 400): EstadoPresupuesto => {
    const clave = claveObjetivo(objetivo);
    const [estado, setEstado] = useState<EstadoPresupuesto>(SIN_PRESUPUESTO);

    useEffect(() => {
        if (!activo) {
            setEstado(SIN_PRESUPUESTO);
            return;
        }
        let vigente = true;
        setEstado((e) => ({ ...e, calculando: true, error: "" }));
        const temporizador = setTimeout(async () => {
            try {
                const presupuesto = await postPresupuesto(JSON.parse(clave) as Objetivo);
                if (vigente) setEstado({ presupuesto, calculando: false, error: "" });
            } catch (e) {
                const err = e as { descripcion?: string; message?: string };
                if (vigente) {
                    setEstado({
                        presupuesto: null, calculando: false,
                        error: err.descripcion || err.message || "No se ha podido calcular el presupuesto.",
                    });
                }
            }
        }, retardoMs);
        return () => {
            vigente = false;
            clearTimeout(temporizador);
        };
    }, [clave, activo, retardoMs]);

    return estado;
};

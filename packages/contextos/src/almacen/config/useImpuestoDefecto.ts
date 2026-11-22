import { useEffect, useRef, useState } from "react";
import { conImpuestoDefecto, impuestoDefecto, UsoImpuestoDefecto } from "./dominio.ts";
import { getConfigAlmacen } from "./infraestructura.ts";

/**
 * El impuesto por defecto de Configuración de almacén para un artículo o una línea nueva
 * (null mientras se carga o si no hay). Si no se puede leer la configuración (p. ej. sin
 * permiso), no hay impuesto por defecto en la web: el servidor lo aplica igualmente.
 */
export const useImpuestoDefecto = (uso: UsoImpuestoDefecto): string | null => {
    const [impuesto, setImpuesto] = useState<string | null>(null);

    useEffect(() => {
        let vigente = true;
        getConfigAlmacen()
            .then((config) => vigente && setImpuesto(impuestoDefecto(config, uso)))
            .catch(() => undefined);
        return () => {
            vigente = false;
        };
    }, [uso]);

    return impuesto;
};

/**
 * Propone el impuesto por defecto en el campo `campo` del formulario de alta, una sola vez y
 * solo si el campo sigue vacío (no pisa lo elegido ni el impuesto de un artículo ya elegido).
 * Devuelve el impuesto, para reiniciar el formulario con él.
 */
export const useAplicarImpuestoDefecto = <T extends object>(
    formulario: { modelo: T; set: (modelo: T) => void },
    campo: keyof T,
    uso: UsoImpuestoDefecto,
): string | null => {
    const impuesto = useImpuestoDefecto(uso);
    const aplicado = useRef(false);

    useEffect(() => {
        if (!impuesto || aplicado.current) return;
        aplicado.current = true;
        const conImpuesto = conImpuestoDefecto(formulario.modelo, campo, impuesto);
        if (conImpuesto !== formulario.modelo) formulario.set(conImpuesto);
        // Solo al conocer el impuesto: después manda lo que haga el usuario.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [impuesto]);

    return impuesto;
};

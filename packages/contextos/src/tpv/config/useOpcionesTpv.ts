import { useEffect, useState } from "react";
import { getTpvConfig } from "../comun/dominio.ts";
import { OpcionesTpv } from "./diseño.ts";
import { opcionesTpvPorDefecto } from "./dominio.ts";

// Opciones de flujo del TPV. Hasta que se leen (o si falla la lectura) valen los
// valores por defecto.
export const useOpcionesTpv = (): OpcionesTpv => {
    const [opciones, setOpciones] = useState<OpcionesTpv>(opcionesTpvPorDefecto);

    useEffect(() => {
        let activo = true;
        getTpvConfig()
            .then((config) => {
                if (activo) setOpciones(config.opciones);
            })
            .catch(() => { });
        return () => {
            activo = false;
        };
    }, []);

    return opciones;
};

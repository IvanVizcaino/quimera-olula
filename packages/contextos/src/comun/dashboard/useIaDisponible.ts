import { useEffect, useState } from "react";
import { getIaDisponible } from "./infraestructura.ts";

/** Si hay un modelo de IA activo; `false` mientras se comprueba. */
export const useIaDisponible = (): boolean => {
  const [disponible, setDisponible] = useState(false);
  useEffect(() => {
    let cancelado = false;
    getIaDisponible().then((d) => !cancelado && setDisponible(d));
    return () => {
      cancelado = true;
    };
  }, []);
  return disponible;
};

import { useEffect, useState } from "react";
import { RecursoAgregable } from "./diseño.ts";
import { getRecursos } from "./infraestructura.ts";

/** Recursos agregables que el usuario puede ver (una petición por sesión). */
export const useRecursos = (): RecursoAgregable[] => {
  const [recursos, setRecursos] = useState<RecursoAgregable[]>([]);
  useEffect(() => {
    let cancelado = false;
    getRecursos().then((r) => !cancelado && setRecursos(r));
    return () => {
      cancelado = true;
    };
  }, []);
  return recursos;
};

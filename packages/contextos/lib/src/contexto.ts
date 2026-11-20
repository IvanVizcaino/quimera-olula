import React from "react";

import type { AccionError } from "./errores_limite.ts";

export type QError = {
  nombre: string;
  descripcion?: string;
  estado?: number;
  /** Enlace o indicación que se ofrece junto al mensaje (p. ej. errores de límites del plan). */
  accion?: AccionError;
};

export type Intentar = <Out>(f: () => Out, onError?: (error: unknown) => void) => Promise<Out>;
export type TipoContextoError = {
  error: QError | null;
  setError: (_: QError) => void;
  intentar: Intentar;
};

export const ContextoError = React.createContext<TipoContextoError>({
  error: null,
  setError: () => { },
  intentar: async (f) => {
    return await f();
  }
});
import { useCallback, useEffect, useState } from "react";
import { ConfigWidgets, DefinicionWidget, OrigenWidgets } from "./diseño.ts";
import {
  getWidgetsUsuario,
  guardarWidgetsUsuario,
  restaurarWidgetsUsuario,
} from "./infraestructura.ts";

/**
 * Widgets que ve el usuario: los suyos, si no los de la empresa y si no los
 * por defecto del módulo. Si el servidor no responde se quedan los por defecto
 * y no se ofrece personalizar.
 */
export const useWidgetsUsuario = (config: ConfigWidgets | undefined) => {
  const [guardados, setGuardados] = useState<DefinicionWidget[] | null>(null);
  const [origen, setOrigen] = useState<OrigenWidgets>(null);
  const [disponible, setDisponible] = useState(false);
  const recurso = config?.recurso;

  useEffect(() => {
    if (!recurso) return;
    let cancelado = false;
    getWidgetsUsuario(recurso)
      .then((respuesta) => {
        if (cancelado) return;
        setGuardados(respuesta.widgets);
        setOrigen(respuesta.origen);
        setDisponible(true);
      })
      .catch(() => !cancelado && setDisponible(false));
    return () => {
      cancelado = true;
    };
  }, [recurso]);

  const guardar = useCallback(
    async (widgets: DefinicionWidget[]) => {
      if (!recurso) return;
      await guardarWidgetsUsuario(recurso, widgets);
      setGuardados(widgets);
      setOrigen("usuario");
    },
    [recurso]
  );

  const restaurar = useCallback(async () => {
    if (!recurso) return;
    await restaurarWidgetsUsuario(recurso);
    const respuesta = await getWidgetsUsuario(recurso);
    setGuardados(respuesta.widgets);
    setOrigen(respuesta.origen);
  }, [recurso]);

  return {
    widgets: guardados ?? config?.widgets ?? [],
    origen,
    personalizable: disponible,
    guardar,
    restaurar,
  };
};

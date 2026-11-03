import { useEffect, useState } from "react";
import { ConfigWidgets } from "./diseño.ts";
import { configDesdeRecurso, recursoParaRuta } from "./dominio.ts";
import { getRecursosAgregables } from "./infraestructura.ts";

/**
 * Widgets para un maestro que no los define: si la ruta de la pantalla tiene un
 * recurso agregable en el servidor, el usuario puede crear los suyos. La ruta se
 * lee al montar (cada pantalla monta su propio maestro), sin depender del router.
 */
export const useConfigWidgetsAuto = (
  activo: boolean
): ConfigWidgets | undefined => {
  const [config, setConfig] = useState<ConfigWidgets>();

  useEffect(() => {
    if (!activo) return;
    let cancelado = false;
    const ruta = window.location.pathname;
    getRecursosAgregables().then((recursos) => {
      if (cancelado) return;
      const recurso = recursoParaRuta(recursos, ruta);
      setConfig(recurso ? configDesdeRecurso(recurso) : undefined);
    });
    return () => {
      cancelado = true;
    };
  }, [activo]);

  return activo ? config : undefined;
};

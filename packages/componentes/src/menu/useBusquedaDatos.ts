import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { useEffect, useState } from "react";
import { GrupoBusquedaDatos } from "./dominio.ts";

const ESPERA_MS = 250;
const LONGITUD_MINIMA = 2;

/**
 * Datos que contienen el texto (GET /comun/busqueda): hasta 3 por tipo de
 * clientes, proveedores y documentos. Espera a que se deje de escribir y descarta
 * las respuestas de búsquedas anteriores.
 */
export const useBusquedaDatos = (texto: string) => {
  const [grupos, setGrupos] = useState<GrupoBusquedaDatos[]>([]);
  const [cargando, setCargando] = useState(false);
  const consulta = texto.trim();

  useEffect(() => {
    if (consulta.length < LONGITUD_MINIMA) {
      setGrupos([]);
      setCargando(false);
      return;
    }
    let cancelado = false;
    setCargando(true);
    const temporizador = setTimeout(() => {
      RestAPI.get<{ grupos: GrupoBusquedaDatos[] }>(
        `/comun/busqueda?q=${encodeURIComponent(consulta)}`
      )
        .then((r) => !cancelado && setGrupos(r.grupos))
        .catch(() => !cancelado && setGrupos([]))
        .finally(() => !cancelado && setCargando(false));
    }, ESPERA_MS);
    return () => {
      cancelado = true;
      clearTimeout(temporizador);
    };
  }, [consulta]);

  return { grupos, cargando };
};

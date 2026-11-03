import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Filtro } from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import { useEffect, useRef, useState } from "react";
import { ConfigWidgets, PuntoWidget, SeriesWidgets, ValoresWidgets } from "./diseño.ts";
import {
  agrupacionWidget,
  agruparPorFiltro,
  aliasWidget,
  esAgrupado,
  filtroWidget,
  metricaWidget,
  puntosWidget,
} from "./dominio.ts";

type RespuestaTotales = {
  totales: Record<string, number | null>;
  grupos: Record<string, unknown>[];
};

const ESPERA_MS = 300;

/**
 * Totales de los widgets para el filtro del listado. Se recalcula (con espera)
 * al cambiar el filtro o `claveRecarga` (p. ej. el total de entidades tras crear
 * o borrar), nunca al paginar.
 */
export const useTotalesWidgets = (
  config: ConfigWidgets | undefined,
  filtro: Filtro | undefined,
  claveRecarga?: unknown
) => {
  const [valores, setValores] = useState<ValoresWidgets>({});
  const [series, setSeries] = useState<SeriesWidgets>({});
  const [cargando, setCargando] = useState(false);

  // Solo se recarga si `claveRecarga` cambia DESPUÉS de tener valor: la primera
  // llegada del total del listado (de vacío a N) no debe cancelar y repetir la
  // petición inicial, que sale en paralelo con la del listado.
  const [recargas, setRecargas] = useState(0);
  const recargaPrevia = useRef(claveRecarga);
  useEffect(() => {
    if (recargaPrevia.current && recargaPrevia.current !== claveRecarga) {
      setRecargas((n) => n + 1);
    }
    recargaPrevia.current = claveRecarga;
  }, [claveRecarga]);

  const claveFiltro = JSON.stringify(filtro ?? []);
  const claveWidgets = JSON.stringify(config ?? null);

  useEffect(() => {
    if (!config || config.widgets.length === 0) return;
    let cancelado = false;

    const temporizador = setTimeout(async () => {
      setCargando(true);
      const url = (query: string, extra: string) =>
        `/comun/agregado/${config.recurso}${query}${query === "?" ? "" : "&"}${extra}`;
      // Los agrupados (temporal, anillo, ranking), uno a uno: el total del filtro
      // como valor y sus grupos como serie.
      const agrupados = config.widgets.filter(esAgrupado);
      const pedirAgrupados = Promise.all(
        agrupados.map(async (widget) => {
          const query = criteriaQuery(filtroWidget(filtro, widget)) || "?";
          const metricas = `metricas=${encodeURIComponent(metricaWidget(widget))}`;
          try {
            const respuesta = await RestAPI.get<RespuestaTotales>(
              url(query, `${metricas}&${agrupacionWidget(widget)}`)
            );
            return [
              widget.id,
              respuesta.totales[aliasWidget(widget)] ?? null,
              puntosWidget(widget, respuesta.grupos),
            ] as const;
          } catch {
            return [widget.id, null, [] as PuntoWidget[]] as const;
          }
        })
      );
      const grupos = agruparPorFiltro(config.widgets.filter((w) => !esAgrupado(w)));
      const resultados = await Promise.all(
        grupos.map(async (grupo) => {
          const metricas = grupo.map(metricaWidget).join(",");
          const query = criteriaQuery(filtroWidget(filtro, grupo[0])) || "?";
          const separador = query === "?" ? "" : "&";
          try {
            const respuesta = await RestAPI.get<RespuestaTotales>(
              `/comun/agregado/${config.recurso}${query}${separador}metricas=${encodeURIComponent(metricas)}`
            );
            return grupo.map((widget) => [
              widget.id,
              respuesta.totales[aliasWidget(widget)] ?? null,
            ]);
          } catch {
            // Filtro que el servidor no sabe totalizar: el widget muestra "—".
            return grupo.map((widget) => [widget.id, null]);
          }
        })
      );
      const resultadosAgrupados = await pedirAgrupados;
      if (cancelado) return;
      setValores({
        ...Object.fromEntries(resultados.flat()),
        ...Object.fromEntries(resultadosAgrupados.map(([id, valor]) => [id, valor])),
      });
      setSeries(Object.fromEntries(resultadosAgrupados.map(([id, , puntos]) => [id, puntos])));
      setCargando(false);
    }, ESPERA_MS);

    return () => {
      cancelado = true;
      clearTimeout(temporizador);
    };
    // Las claves serializadas evitan recargar por objetos nuevos con el mismo contenido.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claveWidgets, claveFiltro, recargas]);

  return { valores, series, cargando };
};

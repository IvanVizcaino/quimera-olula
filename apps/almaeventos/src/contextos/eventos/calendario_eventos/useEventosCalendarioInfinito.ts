import { ClausulaFiltro } from "@olula/lib/diseño.ts";
import { useCallback, useEffect, useRef, useState } from "react";
import { EventoCalendario } from "./diseño.ts";
import { getEventosCalendario } from "./infraestructura.ts";

interface RangoFechas {
  inicio: Date;
  fin: Date;
}

interface EventosCalendarioState {
  eventos: EventoCalendario[];
  cargando: boolean;
  rangoActual: RangoFechas;
  expandirRangoAnterior: () => Promise<void>;
  expandirRangoPosterior: () => Promise<void>;
  resetear: (fechaInicial?: Date) => void;
  verificarRango: (fecha: Date) => Promise<void>;
}

const MESES_BUFFER = 3; // Meses a cargar por cada lado

// Helpers para manejo de fechas
const obtenerInicioMes = (fecha: Date): Date => {
  return new Date(fecha.getFullYear(), fecha.getMonth(), 1);
};

const obtenerFinMes = (fecha: Date): Date => {
  return new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0, 23, 59, 59);
};

const restarMeses = (fecha: Date, meses: number): Date => {
  const nuevaFecha = new Date(fecha);
  nuevaFecha.setMonth(nuevaFecha.getMonth() - meses);
  return nuevaFecha;
};

const sumarMeses = (fecha: Date, meses: number): Date => {
  const nuevaFecha = new Date(fecha);
  nuevaFecha.setMonth(nuevaFecha.getMonth() + meses);
  return nuevaFecha;
};

const formatearFecha = (fecha: Date): string => {
  return fecha.toISOString().split('T')[0];
};

export const useEventosCalendarioInfinito = (filtro: ClausulaFiltro[]): EventosCalendarioState => {
  const [eventos, setEventos] = useState<EventoCalendario[]>([]);
  const [cargando, setCargando] = useState(false);
  const [rangoActual, setRangoActual] = useState<RangoFechas>(() => {
    const hoy = new Date();
    const inicio = obtenerInicioMes(restarMeses(hoy, MESES_BUFFER));
    const fin = obtenerFinMes(sumarMeses(hoy, MESES_BUFFER));
    return { inicio, fin };
  });

  // Ref para evitar múltiples cargas simultáneas
  const cargandoRef = useRef(false);
  const filtroRef = useRef(filtro);
  const ultimaCargaAnteriorRef = useRef<number>(0);
  const ultimaCargaPosteriorRef = useRef<number>(0);

  // Función para cargar eventos en un rango
  const cargarEventosRango = useCallback(async (inicio: Date, fin: Date): Promise<EventoCalendario[]> => {
    const fechaInicio = formatearFecha(inicio);
    const fechaFin = formatearFecha(fin);

    const resultado = await getEventosCalendario(filtro, ["finicio", "ASC"], fechaInicio, fechaFin);
    return resultado;
  }, [filtro]);

  // Carga inicial y recarga cuando cambian los filtros
  useEffect(() => {
    const cargarInicial = async () => {
      if (cargandoRef.current) {
        return;
      }

      setCargando(true);
      cargandoRef.current = true;

      try {
        const eventosIniciales = await cargarEventosRango(rangoActual.inicio, rangoActual.fin);
        setEventos(eventosIniciales);
      } catch (error) {
        console.error("Error cargando eventos iniciales:", error);
        setEventos([]);
      } finally {
        setCargando(false);
        cargandoRef.current = false;
      }
    };

    // Solo recargar si cambiaron los filtros
    const filtrosHanCambiado = JSON.stringify(filtro) !== JSON.stringify(filtroRef.current);

    if (filtrosHanCambiado) {
      filtroRef.current = filtro;
      cargarInicial();
    } else if (eventos.length === 0) {
      // Carga inicial si no hay eventos
      cargarInicial();
    }
  }, [filtro, rangoActual, cargarEventosRango, eventos.length]);

  // Expandir rango hacia atrás (cargar meses anteriores)
  const expandirRangoAnterior = useCallback(async () => {
    if (cargandoRef.current) {
      return;
    }

    // Verificar si realmente necesitamos cargar más datos anteriores
    const fechaObjetivo = restarMeses(rangoActual.inicio, MESES_BUFFER);
    const yaTememosDatos = rangoActual.inicio <= fechaObjetivo;

    if (yaTememosDatos) {
      return;
    }

    // Throttle inteligente: solo si han pasado al menos 500ms desde la última carga anterior
    const ahora = Date.now();
    if (ahora - ultimaCargaAnteriorRef.current < 500) {
      return;
    }

    ultimaCargaAnteriorRef.current = ahora;
    setCargando(true);
    cargandoRef.current = true;

    try {
      const nuevoInicio = obtenerInicioMes(restarMeses(rangoActual.inicio, MESES_BUFFER));

      // Cargar desde nuevoInicio hasta rangoActual.inicio (sin overlap)
      const fechaFin = new Date(rangoActual.inicio.getTime() - 1); // Un día antes para evitar duplicados
      const eventosAnteriores = await cargarEventosRango(nuevoInicio, fechaFin);

      setEventos(eventosActuales => {
        // Combinar eventos anteriores con los actuales (ordenar por fecha)
        const eventosUnificados = [...eventosAnteriores, ...eventosActuales]
          .sort((a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime());

        return eventosUnificados;
      });

      setRangoActual(prev => ({
        ...prev,
        inicio: nuevoInicio
      }));
    } catch (error) {
      console.error("Error expandiendo rango anterior:", error);
    } finally {
      setCargando(false);
      cargandoRef.current = false;
    }
  }, [rangoActual, cargarEventosRango]);

  // Expandir rango hacia adelante (cargar meses posteriores)
  const expandirRangoPosterior = useCallback(async () => {
    if (cargandoRef.current) {
      return;
    }

    // Verificar si realmente necesitamos cargar más datos posteriores
    const fechaObjetivo = sumarMeses(rangoActual.fin, MESES_BUFFER);
    const yaTememosDatos = rangoActual.fin >= fechaObjetivo;

    if (yaTememosDatos) {
      return;
    }

    // Throttle inteligente: solo si han pasado al menos 500ms desde la última carga posterior
    const ahora = Date.now();
    if (ahora - ultimaCargaPosteriorRef.current < 500) {
      return;
    }

    ultimaCargaPosteriorRef.current = ahora;
    setCargando(true);
    cargandoRef.current = true;

    try {
      const nuevoFin = obtenerFinMes(sumarMeses(rangoActual.fin, MESES_BUFFER));

      // Cargar desde rangoActual.fin hasta nuevoFin (sin overlap)
      const fechaInicio = new Date(rangoActual.fin.getTime() + 1); // Un día después para evitar duplicados
      const eventosPosteriores = await cargarEventosRango(fechaInicio, nuevoFin);

      setEventos(eventosActuales => {
        // Combinar eventos actuales con los posteriores (ordenar por fecha)
        const eventosUnificados = [...eventosActuales, ...eventosPosteriores]
          .sort((a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime());

        return eventosUnificados;
      });

      setRangoActual(prev => ({
        ...prev,
        fin: nuevoFin
      }));
    } catch (error) {
      console.error("Error expandiendo rango posterior:", error);
    } finally {
      setCargando(false);
      cargandoRef.current = false;
    }
  }, [rangoActual, cargarEventosRango]);

  // Resetear a una fecha específica
  const resetear = useCallback((fechaInicial?: Date) => {
    const fechaBase = fechaInicial || new Date();
    const nuevoInicio = obtenerInicioMes(restarMeses(fechaBase, MESES_BUFFER));
    const nuevoFin = obtenerFinMes(sumarMeses(fechaBase, MESES_BUFFER));

    setRangoActual({ inicio: nuevoInicio, fin: nuevoFin });
    setEventos([]);
  }, []);

  // Verificar si una fecha está fuera del rango y cargar datos si es necesario
  const verificarRango = useCallback(async (fecha: Date) => {
    const fechaInicio = obtenerInicioMes(fecha);

    // Verificar si necesitamos cargar hacia atrás
    if (fechaInicio < rangoActual.inicio) {
      await expandirRangoAnterior();
    }

    // Verificar si necesitamos cargar hacia adelante  
    if (fechaInicio > rangoActual.fin) {
      await expandirRangoPosterior();
    }
  }, [rangoActual, expandirRangoAnterior, expandirRangoPosterior]);

  return {
    eventos,
    cargando,
    rangoActual,
    expandirRangoAnterior,
    expandirRangoPosterior,
    resetear,
    verificarRango
  };
};

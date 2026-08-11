import { Maquina } from "@olula/lib/diseño.ts";
import {
    ContextoLineasDevolucion,
    EstadoLineasDevolucion,
} from "./diseño.ts";
import {
    aplicarCantidadMaximaProceso,
    aplicarCantidadProceso,
    aplicarDevolucionTotalProceso,
    cargarLineasProceso,
} from "./dominio.ts";

export const getMaquina = (): Maquina<
    EstadoLineasDevolucion,
    ContextoLineasDevolucion
> => ({
    INICIAL: {
        lineas_cargadas: cargarLineasProceso,
        cantidad_aplicada: aplicarCantidadProceso,
        cantidad_maxima_aplicada: aplicarCantidadMaximaProceso,
        devolucion_total_aplicada: aplicarDevolucionTotalProceso,
    },
});

import { Incidencia } from "../diseño.ts";

export type EstadoDetalleIncidencia = "INICIAL" | "BORRANDO" | "CREANDO_PRESUPUESTO";

export type ContextoDetalleIncidencia = {
    estado: EstadoDetalleIncidencia;
    incidencia: Incidencia;
};
import { Ejercicio } from "../diseño.ts";

export type EstadoDetalleEjercicio =
    "INICIAL" | "ABIERTO" | "GENERANDO_PGC" | "CERRANDO" | "DESHACIENDO";

export type ContextoDetalleEjercicio = {
    estado: EstadoDetalleEjercicio;
    ejercicio: Ejercicio;
};

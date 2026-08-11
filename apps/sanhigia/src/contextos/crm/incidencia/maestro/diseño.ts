import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Incidencia } from "../diseño.ts";

export type EstadoMaestroIncidencias = "INICIAL" | "CREANDO";

export type ContextoMaestroIncidencias = {
    estado: EstadoMaestroIncidencias;
    incidencias: ListaActivaEntidades<Incidencia>;
};
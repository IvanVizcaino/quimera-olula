import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { EventoCola } from "../diseño.ts";

export type EstadoMaestroEventoCola = "INICIAL";

export type ContextoMaestroEventoCola = {
    estado: EstadoMaestroEventoCola;
    eventos: ListaActivaEntidades<EventoCola>;
};

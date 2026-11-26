import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.ts";
import { ItemPlanProduccion } from "../diseño.ts";

export type EstadoMaestroPlanProduccion = 'INICIAL' | 'CREANDO';

export type ContextoMaestroPlanProduccion = {
    estado: EstadoMaestroPlanProduccion;
    planes: ListaActivaEntidades<ItemPlanProduccion>;
};

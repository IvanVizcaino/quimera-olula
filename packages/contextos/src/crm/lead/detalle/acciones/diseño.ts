import { Accion } from "#/crm/accion/diseño.ts";
import { ListaEntidades } from "@olula/lib/ListaEntidades.js";

export type EstadoAccionesLead = "INICIAL" | "EDITANDO" | "CREANDO" | "BORRANDO";

export type ContextoAccionesLead = {
    estado: EstadoAccionesLead;
    acciones: ListaEntidades<Accion>;
};
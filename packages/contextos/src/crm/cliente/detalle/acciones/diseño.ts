import { Accion } from "#/crm/accion/diseño.ts";
import { ListaEntidades } from "@olula/lib/ListaEntidades.js";

export type EstadoAccionesCliente = "INICIAL" | "EDITANDO" | "CREANDO" | "BORRANDO";

export type ContextoAccionesCliente = {
    estado: EstadoAccionesCliente;
    acciones: ListaEntidades<Accion>;
};
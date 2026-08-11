import { OportunidadVenta } from "#/crm/oportunidadventa/diseño.ts";
import { ListaEntidades } from "@olula/lib/ListaEntidades.js";

export type EstadoOportunidadesCliente = "INICIAL" | "EDITANDO" | "CREANDO" | "BORRANDO";

export type ContextoOportunidadesCliente = {
    estado: EstadoOportunidadesCliente;
    oportunidades: ListaEntidades<OportunidadVenta>;
};
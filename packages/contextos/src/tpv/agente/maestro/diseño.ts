import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { AgenteTpv } from "../diseño.ts";

export type EstadoMaestroAgenteTpv = "INICIAL" | "CREANDO";

export type ContextoMaestroAgenteTpv = {
    estado: EstadoMaestroAgenteTpv;
    agentes: ListaActivaEntidades<AgenteTpv>;
};

export const metaTablaAgenteTpv: MetaTabla<AgenteTpv> = [
    { id: "id", cabecera: "Código" },
    { id: "nombre", cabecera: "Nombre" },
];

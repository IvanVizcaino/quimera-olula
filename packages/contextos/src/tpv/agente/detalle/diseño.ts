import { AgenteTpv } from "../diseño.ts";

export type EstadoAgenteTpv = "INICIAL" | "Editando" | "Borrando";

export type ContextoAgenteTpv = {
    estado: EstadoAgenteTpv;
    agente: AgenteTpv;
    agenteInicial: AgenteTpv;
};

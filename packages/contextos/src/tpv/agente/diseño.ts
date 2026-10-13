import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

export interface AgenteTpv extends Entidad {
    id: string;
    nombre: string;
}

export interface NuevoAgenteTpv extends Modelo {
    nombre: string;
}

export type CambiosAgenteTpv = Pick<AgenteTpv, "nombre">;

export type GetAgenteTpv = (id: string) => Promise<AgenteTpv>;
export type GetAgentesTpv = (criteria: Criteria) => RespuestaLista<AgenteTpv>;
export type PostAgenteTpv = (nuevo: NuevoAgenteTpv) => Promise<string>;
export type PatchAgenteTpv = (id: string, cambios: CambiosAgenteTpv) => Promise<void>;
export type DeleteAgenteTpv = (id: string) => Promise<void>;

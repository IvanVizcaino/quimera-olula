import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import {
    accionesListaActivaEntidades,
    ProcesarListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { AgenteTpv } from "../diseño.ts";
import { getAgentesTpv } from "../infraestructura.ts";
import { ContextoMaestroAgenteTpv, EstadoMaestroAgenteTpv } from "./diseño.ts";

type ProcesarMaestroAgenteTpv = ProcesarContexto<
    EstadoMaestroAgenteTpv,
    ContextoMaestroAgenteTpv
>;

const conAgentes =
    (fn: ProcesarListaActivaEntidades<AgenteTpv>) =>
        (ctx: ContextoMaestroAgenteTpv) => ({ ...ctx, agentes: fn(ctx.agentes) });

export const Agentes = accionesListaActivaEntidades(conAgentes);

export const recargarAgentes: ProcesarMaestroAgenteTpv = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getAgentesTpv(criteria);
    return Agentes.recargar(contexto, resultado);
};

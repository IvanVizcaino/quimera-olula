import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Agente } from "../diseño.js";
import { getAgente, getAgentesLista } from "../infraestructura.js";
import { ContextoMaestroAgente, EstadoMaestroAgente } from "./diseño.js";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroAgente, ContextoMaestroAgente>;

const conAgentes = (fn: ProcesarListaActivaEntidades<Agente>) =>
    (ctx: ContextoMaestroAgente) => ({ ...ctx, agentes: fn(ctx.agentes) });

export const Agentes = accionesListaActivaEntidades(conAgentes);

export const recargarAgentes: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getAgentesLista(criteria);
    return Agentes.recargar(contexto, resultado);
};

export const ampliarAgentes: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getAgentesLista(criteria);
    return Agentes.ampliar(contexto, resultado);
};

export const incluirAgenteCreadoPorId: ProcesarMaestro = async (contexto, payload) => {
    const id = payload as string;
    const agente = await getAgente(id);
    return {
        ...contexto,
        estado: "INICIAL",
        agentes: {
            ...contexto.agentes,
            lista: [agente, ...contexto.agentes.lista],
            total: contexto.agentes.total + 1,
            activo: agente.id,
        },
    };
};

import { MetaTabla } from "@olula/componentes/index.js";
import { Criteria, ProcesarContexto } from "@olula/lib/diseño.js";
import { ProcesarListaActivaEntidades, accionesListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Lead } from "../diseño.ts";
import { getLeads } from "../infraestructura.ts";
import { ContextoMaestroLeads, EstadoMaestroLeads } from "./diseño.ts";

export const metaTablaLead: MetaTabla<Lead> = [
    { id: "id", cabecera: "Código" },
    { id: "nombre", cabecera: "Nombre" },
    { id: "tipo", cabecera: "Tipo" },
    { id: "estado_id", cabecera: "Estado" },
    { id: "fuente_id", cabecera: "Fuente" },
];

type ProcesarLeads = ProcesarContexto<EstadoMaestroLeads, ContextoMaestroLeads>;

const conLeads = (fn: ProcesarListaActivaEntidades<Lead>) => (ctx: ContextoMaestroLeads) => ({ ...ctx, leads: fn(ctx.leads) });

export const Leads = accionesListaActivaEntidades(conLeads);

export const recargarLeads: ProcesarLeads = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getLeads(criteria.filtro, criteria.orden, criteria.paginacion);

    return Leads.recargar(contexto, resultado);
}

export const ampliarLeads: ProcesarLeads = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getLeads(criteria.filtro, criteria.orden, criteria.paginacion);

    return Leads.ampliar(contexto, resultado);
}
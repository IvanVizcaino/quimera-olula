import { MetaTabla } from "@olula/componentes/index.js";
import { Criteria, ProcesarContexto } from "@olula/lib/diseño.js";
import {
    ProcesarListaActivaEntidades,
    accionesListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { FuenteLead } from "../diseño.ts";
import { getFuentesLead } from "../infraestructura.ts";
import { ContextoMaestroFuentesLead, EstadoMaestroFuentesLead } from "./diseño.ts";

export const metaTablaFuenteLead: MetaTabla<FuenteLead> = [
    { id: "id", cabecera: "Código" },
    { id: "descripcion", cabecera: "Descripción" },
];

type ProcesarFuentesLead = ProcesarContexto<EstadoMaestroFuentesLead, ContextoMaestroFuentesLead>;

const conFuentesLead =
    (fn: ProcesarListaActivaEntidades<FuenteLead>) =>
        (ctx: ContextoMaestroFuentesLead) => ({ ...ctx, fuentes_lead: fn(ctx.fuentes_lead) });

export const FuentesLead = accionesListaActivaEntidades(conFuentesLead);

export const recargarFuentesLead: ProcesarFuentesLead = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getFuentesLead(criteria.filtro, criteria.orden, criteria.paginacion);

    return FuentesLead.recargar(contexto, resultado);
}
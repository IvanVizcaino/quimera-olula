import { Criteria, ProcesarContexto } from "@olula/lib/diseño.js";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Albaran } from "../diseño.ts";
import { getAlbaranes } from "../infraestructura.ts";
import { ContextoMaestroAlbaran, EstadoMaestroAlbaran } from "./diseño.ts";

type ProcesarAlbaranes = ProcesarContexto<EstadoMaestroAlbaran, ContextoMaestroAlbaran>;

const conAlbaranes = (fn: ProcesarListaActivaEntidades<Albaran>) => (ctx: ContextoMaestroAlbaran) => ({ ...ctx, albaranes: fn(ctx.albaranes) });

export const Albaranes = accionesListaActivaEntidades(conAlbaranes);

export const recargarAlbaranes: ProcesarAlbaranes = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getAlbaranes(criteria.filtro, criteria.orden, criteria.paginacion);

    return Albaranes.recargar(contexto, resultado);
}

export const ampliarAlbaranes: ProcesarAlbaranes = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getAlbaranes(criteria.filtro, criteria.orden, criteria.paginacion);

    return Albaranes.ampliar(contexto, resultado);
}

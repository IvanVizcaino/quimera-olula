import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { EventoCola } from "../diseño.ts";
import { getEventosCola } from "../infraestructura.ts";
import { ContextoMaestroEventoCola, EstadoMaestroEventoCola } from "./diseño.ts";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroEventoCola, ContextoMaestroEventoCola>;

const conEventos = (fn: ProcesarListaActivaEntidades<EventoCola>) =>
    (ctx: ContextoMaestroEventoCola) => ({ ...ctx, eventos: fn(ctx.eventos) });

export const Eventos = accionesListaActivaEntidades(conEventos);

export const recargarEventos: ProcesarMaestro = async (contexto, payload) => {
    const criteria = (payload as Criteria | undefined) ?? contexto.eventos.criteria;
    return Eventos.recargar(contexto, await getEventosCola(criteria));
};

export const ampliarEventos: ProcesarMaestro = async (contexto, payload) =>
    Eventos.ampliar(contexto, await getEventosCola(payload as Criteria));

/** Tras «Reiniciar proceso»: se recarga la lista (desaparecen los reintentos) y
 * queda seleccionado el evento original, que ahora está pendiente. */
export const recargarTrasReiniciar: ProcesarMaestro = async (contexto, payload) => {
    const recargado = await recargarEventos(contexto, contexto.eventos.criteria);
    const ctx = recargado as ContextoMaestroEventoCola;
    return { ...ctx, eventos: { ...ctx.eventos, activo: (payload as string) ?? ctx.eventos.activo } };
};

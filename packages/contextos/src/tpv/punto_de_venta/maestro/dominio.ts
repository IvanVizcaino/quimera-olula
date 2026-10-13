import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import {
    accionesListaActivaEntidades,
    ProcesarListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { PuntoVentaTpv } from "../diseño.ts";
import { getPuntosVentaTpv } from "../infraestructura.ts";
import { ContextoMaestroPuntoVentaTpv, EstadoMaestroPuntoVentaTpv } from "./diseño.ts";

type ProcesarMaestro = ProcesarContexto<
    EstadoMaestroPuntoVentaTpv,
    ContextoMaestroPuntoVentaTpv
>;

const conPuntos =
    (fn: ProcesarListaActivaEntidades<PuntoVentaTpv>) =>
        (ctx: ContextoMaestroPuntoVentaTpv) => ({ ...ctx, puntos: fn(ctx.puntos) });

export const Puntos = accionesListaActivaEntidades(conPuntos);

export const recargarPuntos: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getPuntosVentaTpv(criteria);
    return Puntos.recargar(contexto, resultado);
};

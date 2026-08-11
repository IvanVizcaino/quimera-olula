import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import {
    accionesListaActivaEntidades,
    ProcesarListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { Ubicacion } from "../../diseño.ts";
import { getUbicaciones } from "../../infraestructura.ts";
import { ContextoMaestroUbicacion, EstadoMaestroUbicacion } from "./diseño.ts";

type ProcesarMaestroUbicacion = ProcesarContexto<EstadoMaestroUbicacion, ContextoMaestroUbicacion>;

const conUbicaciones =
    (fn: ProcesarListaActivaEntidades<Ubicacion>) =>
        (ctx: ContextoMaestroUbicacion) => ({ ...ctx, ubicaciones: fn(ctx.ubicaciones) });

export const Ubicaciones = accionesListaActivaEntidades(conUbicaciones);

export const recargarUbicaciones: ProcesarMaestroUbicacion = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getUbicaciones(criteria.filtro, criteria.orden, criteria.paginacion);
    return Ubicaciones.recargar(contexto, resultado);
};

export const ampliarUbicaciones: ProcesarMaestroUbicacion = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getUbicaciones(criteria.filtro, criteria.orden, criteria.paginacion);
    return Ubicaciones.ampliar(contexto, resultado);
};

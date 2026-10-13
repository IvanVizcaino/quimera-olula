import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import {
    accionesListaActivaEntidades,
    ProcesarListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { ValeEmitido } from "../diseño.ts";
import { getValesEmitidos } from "../infraestructura.ts";
import { ContextoMaestroVales, EstadoMaestroVales } from "./diseño.ts";

type ProcesarMaestroVales = ProcesarContexto<EstadoMaestroVales, ContextoMaestroVales>;

const conVales =
    (fn: ProcesarListaActivaEntidades<ValeEmitido>) =>
        (ctx: ContextoMaestroVales) => ({ ...ctx, vales: fn(ctx.vales) });

export const Vales = accionesListaActivaEntidades(conVales);

export const recargarVales: ProcesarMaestroVales = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getValesEmitidos(criteria);
    return Vales.recargar(contexto, resultado);
};

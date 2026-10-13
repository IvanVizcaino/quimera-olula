import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import {
    accionesListaActivaEntidades,
    ProcesarListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { Composicion } from "../diseño.ts";
import { getComposiciones } from "../infraestructura.ts";
import { ContextoMaestroComposicion, EstadoMaestroComposicion } from "./diseño.ts";

type ProcesarMaestroComposicion = ProcesarContexto<
    EstadoMaestroComposicion,
    ContextoMaestroComposicion
>;

const conComposiciones =
    (fn: ProcesarListaActivaEntidades<Composicion>) =>
        (ctx: ContextoMaestroComposicion) => ({ ...ctx, composiciones: fn(ctx.composiciones) });

export const Composiciones = accionesListaActivaEntidades(conComposiciones);

export const recargarComposiciones: ProcesarMaestroComposicion = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getComposiciones(criteria);
    return Composiciones.recargar(contexto, resultado);
};

import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import {
    accionesListaActivaEntidades,
    ProcesarListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { UnidadMedida } from "../diseño.ts";
import { getUnidadesMedida } from "../infraestructura.ts";
import { ContextoMaestroUnidadMedida, EstadoMaestroUnidadMedida } from "./diseño.ts";

type ProcesarMaestroUnidadMedida = ProcesarContexto<
    EstadoMaestroUnidadMedida,
    ContextoMaestroUnidadMedida
>;

const conUnidades =
    (fn: ProcesarListaActivaEntidades<UnidadMedida>) =>
        (ctx: ContextoMaestroUnidadMedida) => ({ ...ctx, unidades: fn(ctx.unidades) });

export const UnidadesMedida = accionesListaActivaEntidades(conUnidades);

export const recargarUnidadesMedida: ProcesarMaestroUnidadMedida = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getUnidadesMedida(criteria);
    return UnidadesMedida.recargar(contexto, resultado);
};

import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.ts";
import { ItemPlanProduccion } from "../diseño.ts";
import { getPlanesProduccion, getPlanProduccion } from "../infraestructura.ts";
import { ContextoMaestroPlanProduccion, EstadoMaestroPlanProduccion } from "./diseño.ts";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroPlanProduccion, ContextoMaestroPlanProduccion>;

const conPlanes = (fn: ProcesarListaActivaEntidades<ItemPlanProduccion>) =>
    (ctx: ContextoMaestroPlanProduccion) => ({ ...ctx, planes: fn(ctx.planes) });

export const Planes = accionesListaActivaEntidades(conPlanes);

export const recargarPlanes: ProcesarMaestro = async (contexto, payload) => {
    const resultado = await getPlanesProduccion(payload as Criteria);
    return Planes.recargar(contexto, resultado);
};

export const ampliarPlanes: ProcesarMaestro = async (contexto, payload) => {
    const resultado = await getPlanesProduccion(payload as Criteria);
    return Planes.ampliar(contexto, resultado);
};

/** El modal ya hizo el POST; se obtiene la cabecera y se incluye en la lista. */
export const incluirPlanCreadoPorId: ProcesarMaestro = async (contexto, payload) => {
    const { cabecera } = await getPlanProduccion(payload as string);
    return {
        ...contexto,
        estado: "INICIAL",
        planes: {
            ...contexto.planes,
            lista: [cabecera, ...contexto.planes.lista],
            total: contexto.planes.total + 1,
            activo: cabecera.id,
        },
    };
};

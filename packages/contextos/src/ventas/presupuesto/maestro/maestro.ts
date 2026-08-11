import { Criteria, ProcesarContexto } from "@olula/lib/diseño.js";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { getPresupuestos } from "../infraestructura.ts";
import { ContextoMaestroPresupuesto, EstadoMaestroPresupuesto, Presupuesto } from "./diseño.ts";

type ProcesarPresupuestos = ProcesarContexto<EstadoMaestroPresupuesto, ContextoMaestroPresupuesto>;

const conPresupuestos = (fn: ProcesarListaActivaEntidades<Presupuesto>) => (ctx: ContextoMaestroPresupuesto) => ({ ...ctx, presupuestos: fn(ctx.presupuestos) });

export const Presupuestos = accionesListaActivaEntidades(conPresupuestos);

export const recargarPresupuestos: ProcesarPresupuestos = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getPresupuestos(criteria.filtro, criteria.orden, criteria.paginacion);

    return Presupuestos.recargar(contexto, resultado);
}

export const ampliarPresupuestos: ProcesarPresupuestos = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getPresupuestos(criteria.filtro, criteria.orden, criteria.paginacion);

    return Presupuestos.ampliar(contexto, resultado);
}

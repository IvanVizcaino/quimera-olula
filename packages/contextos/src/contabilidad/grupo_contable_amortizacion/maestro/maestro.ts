import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { GrupoContableAmortizacion } from "../diseño.ts";
import { getGrupoContableAmortizacion, getGruposContablesAmortizacion } from "../infraestructura.ts";
import {
    ContextoMaestroGrupoContableAmortizacion,
    EstadoMaestroGrupoContableAmortizacion,
} from "./diseño.ts";

type ProcesarMaestro = ProcesarContexto<
    EstadoMaestroGrupoContableAmortizacion,
    ContextoMaestroGrupoContableAmortizacion
>;

const conGrupos = (fn: ProcesarListaActivaEntidades<GrupoContableAmortizacion>) =>
    (ctx: ContextoMaestroGrupoContableAmortizacion) => ({
        ...ctx,
        grupos: fn(ctx.grupos),
    });

export const Grupos = accionesListaActivaEntidades(conGrupos);

export const recargarGrupos: ProcesarMaestro = async (contexto, payload) => {
    const criteria = (payload as Criteria | undefined) ?? contexto.grupos.criteria;
    const resultado = await getGruposContablesAmortizacion(criteria);
    return Grupos.recargar(contexto, resultado);
};

export const ampliarGrupos: ProcesarMaestro = async (contexto, payload) => {
    const resultado = await getGruposContablesAmortizacion(payload as Criteria);
    return Grupos.ampliar(contexto, resultado);
};

export const incluirGrupoCreadoPorId: ProcesarMaestro = async (contexto, payload) => {
    const grupo = await getGrupoContableAmortizacion(payload as string);
    return {
        ...contexto,
        estado: "INICIAL",
        grupos: {
            ...contexto.grupos,
            lista: [grupo, ...contexto.grupos.lista],
            total: contexto.grupos.total + 1,
            activo: grupo.id,
        },
    };
};

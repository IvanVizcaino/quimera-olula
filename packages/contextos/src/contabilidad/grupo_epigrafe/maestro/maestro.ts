import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { GrupoEpigrafe } from "../diseño.ts";
import {
    getGrupoEpigrafe,
    getGruposEpigrafes,
} from "../infraestructura.ts";
import {
    ContextoMaestroGrupoEpigrafe,
    EstadoMaestroGrupoEpigrafe,
} from "./diseño.ts";

type ProcesarMaestro = ProcesarContexto<
    EstadoMaestroGrupoEpigrafe,
    ContextoMaestroGrupoEpigrafe
>;

const conGrupos = (fn: ProcesarListaActivaEntidades<GrupoEpigrafe>) =>
    (ctx: ContextoMaestroGrupoEpigrafe) => ({
        ...ctx,
        grupos: fn(ctx.grupos),
    });

export const Grupos = accionesListaActivaEntidades(conGrupos);

export const recargarGrupos: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getGruposEpigrafes(criteria);
    return Grupos.recargar(contexto, resultado);
};

export const ampliarGrupos: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getGruposEpigrafes(criteria);
    return Grupos.ampliar(contexto, resultado);
};

export const incluirGrupoCreadoPorId: ProcesarMaestro = async (
    contexto,
    payload
) => {
    const id = payload as string;
    const grupo = await getGrupoEpigrafe(id);
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

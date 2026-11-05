import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Epigrafe } from "../diseño.ts";
import { getEpigrafe, getEpigrafes } from "../infraestructura.ts";
import {
    ContextoMaestroEpigrafe,
    EstadoMaestroEpigrafe,
} from "./diseño.ts";

type ProcesarMaestro = ProcesarContexto<
    EstadoMaestroEpigrafe,
    ContextoMaestroEpigrafe
>;

const conEpigrafes = (fn: ProcesarListaActivaEntidades<Epigrafe>) =>
    (ctx: ContextoMaestroEpigrafe) => ({ ...ctx, epigrafes: fn(ctx.epigrafes) });

export const Epigrafes = accionesListaActivaEntidades(conEpigrafes);

export const recargarEpigrafes: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getEpigrafes(criteria);
    return Epigrafes.recargar(contexto, resultado);
};

export const ampliarEpigrafes: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getEpigrafes(criteria);
    return Epigrafes.ampliar(contexto, resultado);
};

export const incluirEpigrafeCreadoPorId: ProcesarMaestro = async (
    contexto,
    payload
) => {
    const id = payload as string;
    const epigrafe = await getEpigrafe(id);
    return {
        ...contexto,
        estado: "INICIAL",
        epigrafes: {
            ...contexto.epigrafes,
            lista: [epigrafe, ...contexto.epigrafes.lista],
            total: contexto.epigrafes.total + 1,
            activo: epigrafe.id,
        },
    };
};

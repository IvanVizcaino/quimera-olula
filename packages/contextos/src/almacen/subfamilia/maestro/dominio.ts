import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import {
    accionesListaActivaEntidades,
    ProcesarListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { Subfamilia } from "../diseño.ts";
import { getSubfamilias } from "../infraestructura.ts";
import { ContextoMaestroSubfamilia, EstadoMaestroSubfamilia } from "./diseño.ts";

type ProcesarMaestroSubfamilia = ProcesarContexto<
    EstadoMaestroSubfamilia,
    ContextoMaestroSubfamilia
>;

const conSubfamilias =
    (fn: ProcesarListaActivaEntidades<Subfamilia>) =>
        (ctx: ContextoMaestroSubfamilia) => ({ ...ctx, subfamilias: fn(ctx.subfamilias) });

export const Subfamilias = accionesListaActivaEntidades(conSubfamilias);

export const recargarSubfamilias: ProcesarMaestroSubfamilia = async (
    contexto,
    payload
) => {
    const criteria = payload as Criteria;
    const resultado = await getSubfamilias(criteria);
    return Subfamilias.recargar(contexto, resultado);
};

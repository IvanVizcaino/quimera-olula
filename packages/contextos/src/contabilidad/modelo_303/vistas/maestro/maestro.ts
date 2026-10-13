import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { ItemModelo303 } from "../../diseño.ts";
import { getModelos303 } from "../../infraestructura.ts";
import { ContextoMaestroModelo303, EstadoMaestroModelo303 } from "./maquina.ts";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroModelo303, ContextoMaestroModelo303>;

const conModelos = (fn: ProcesarListaActivaEntidades<ItemModelo303>) =>
    (ctx: ContextoMaestroModelo303) => ({ ...ctx, modelos: fn(ctx.modelos) });

export const Modelos303 = accionesListaActivaEntidades(conModelos);

export const recargarModelos303: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getModelos303(criteria);
    return Modelos303.recargar(contexto, resultado);
};

export const ampliarModelos303: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getModelos303(criteria);
    return Modelos303.ampliar(contexto, resultado);
};

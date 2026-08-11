import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { ItemModLin } from "../diseño.js";
import { getModLin, getModLins } from "../infraestructura.js";
import { ContextoMaestroModLin, EstadoMaestroModLin } from "./maquina.js";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroModLin, ContextoMaestroModLin>;

const conModLins = (fn: ProcesarListaActivaEntidades<ItemModLin>) =>
    (ctx: ContextoMaestroModLin) => ({ ...ctx, modLins: fn(ctx.modLins) });

export const ModLins = accionesListaActivaEntidades(conModLins);

export const recargarModLins: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getModLins(criteria);
    return ModLins.recargar(contexto, resultado);
};

export const ampliarModLins: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getModLins(criteria);
    return ModLins.ampliar(contexto, resultado);
};

/**
 * Incluir módulo recién creado por ID (flujo con modal CrearModulo).
 * El modal ya realizó el POST; aquí se obtiene la entidad completa
 * y se incluye como item ligero en la lista.
 */
export const incluirModLinCreadoPorId: ProcesarMaestro = async (contexto, payload) => {
    const id = payload as string;
    const modLin = await getModLin(id);
    return {
        ...contexto,
        estado: "INICIAL",
        modLins: {
            ...contexto.modLins,
            lista: [modLin, ...contexto.modLins.lista],
            total: contexto.modLins.total + 1,
            activo: modLin.id,
        },
    };
};

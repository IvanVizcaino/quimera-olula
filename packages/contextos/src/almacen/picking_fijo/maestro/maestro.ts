import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { PickingFijo } from "../diseño.ts";
import { getPickingFijo, getPickingsFijos } from "../infraestructura.ts";
import { ContextoMaestroPickingFijo, EstadoMaestroPickingFijo } from "./maquina.ts";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroPickingFijo, ContextoMaestroPickingFijo>;

const conPickings = (fn: ProcesarListaActivaEntidades<PickingFijo>) =>
    (ctx: ContextoMaestroPickingFijo) => ({ ...ctx, pickings: fn(ctx.pickings) });

export const Pickings = accionesListaActivaEntidades(conPickings);

export const recargarPickings: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getPickingsFijos(criteria);
    return Pickings.recargar(contexto, resultado);
};

export const ampliarPickings: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getPickingsFijos(criteria);
    return Pickings.ampliar(contexto, resultado);
};

export const incluirPickingCreadoPorId: ProcesarMaestro = async (contexto, payload) => {
    const id = payload as string;
    const picking = await getPickingFijo(id);
    return {
        ...contexto,
        estado: "INICIAL" as EstadoMaestroPickingFijo,
        pickings: {
            ...contexto.pickings,
            lista: [picking, ...contexto.pickings.lista],
            total: contexto.pickings.total + 1,
            activo: picking.id,
        },
    };
};

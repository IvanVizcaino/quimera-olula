import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { ItemPlantillaAsiento } from "../diseño.ts";
import { getPlantillaAsiento, getPlantillasAsiento } from "../infraestructura.ts";
import { ContextoMaestroPlantillaAsiento, EstadoMaestroPlantillaAsiento } from "./maquina.ts";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroPlantillaAsiento, ContextoMaestroPlantillaAsiento>;

const conPlantillas = (fn: ProcesarListaActivaEntidades<ItemPlantillaAsiento>) =>
    (ctx: ContextoMaestroPlantillaAsiento) => ({ ...ctx, plantillas: fn(ctx.plantillas) });

export const Plantillas = accionesListaActivaEntidades(conPlantillas);

export const recargarPlantillas: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getPlantillasAsiento(criteria);
    return Plantillas.recargar(contexto, resultado);
};

export const ampliarPlantillas: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getPlantillasAsiento(criteria);
    return Plantillas.ampliar(contexto, resultado);
};

/** El modal ya hizo el POST: se lee la plantilla y se incluye en la lista. */
export const incluirPlantillaCreadaPorId: ProcesarMaestro = async (contexto, payload) => {
    const id = payload as string;
    const plantilla = await getPlantillaAsiento(id);
    return {
        ...contexto,
        estado: "INICIAL",
        plantillas: {
            ...contexto.plantillas,
            lista: [plantilla, ...contexto.plantillas.lista],
            total: contexto.plantillas.total + 1,
            activo: plantilla.id,
        },
    };
};

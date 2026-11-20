import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { PesoMedida } from "../diseño.ts";
import { getPesoMedida, getPesosMedidas } from "../infraestructura.ts";
import { ContextoMaestroPesoMedida, EstadoMaestroPesoMedida } from "./maquina.ts";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroPesoMedida, ContextoMaestroPesoMedida>;

const conPesosMedidas = (fn: ProcesarListaActivaEntidades<PesoMedida>) =>
    (ctx: ContextoMaestroPesoMedida) => ({ ...ctx, pesosMedidas: fn(ctx.pesosMedidas) });

export const PesosMedidas = accionesListaActivaEntidades(conPesosMedidas);

export const recargarPesosMedidas: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getPesosMedidas(criteria);
    return PesosMedidas.recargar(contexto, resultado);
};

export const ampliarPesosMedidas: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getPesosMedidas(criteria);
    return PesosMedidas.ampliar(contexto, resultado);
};

export const incluirPesoMedidaCreadoPorId: ProcesarMaestro = async (contexto, payload) => {
    const id = payload as string;
    const pesoMedida = await getPesoMedida(id);
    return {
        ...contexto,
        estado: "INICIAL" as EstadoMaestroPesoMedida,
        pesosMedidas: {
            ...contexto.pesosMedidas,
            lista: [pesoMedida, ...contexto.pesosMedidas.lista],
            total: contexto.pesosMedidas.total + 1,
            activo: pesoMedida.id,
        },
    };
};

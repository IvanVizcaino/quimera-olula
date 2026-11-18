import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { ClaseAlmacenamiento } from "../diseño.ts";
import { getClaseAlmacenamiento, getClasesAlmacenamiento } from "../infraestructura.ts";
import { ContextoMaestroClaseAlmacenamiento, EstadoMaestroClaseAlmacenamiento } from "./maquina.ts";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroClaseAlmacenamiento, ContextoMaestroClaseAlmacenamiento>;

const conClases = (fn: ProcesarListaActivaEntidades<ClaseAlmacenamiento>) =>
    (ctx: ContextoMaestroClaseAlmacenamiento) => ({ ...ctx, clases: fn(ctx.clases) });

export const Clases = accionesListaActivaEntidades(conClases);

export const recargarClases: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getClasesAlmacenamiento(criteria);
    return Clases.recargar(contexto, resultado);
};

export const ampliarClases: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getClasesAlmacenamiento(criteria);
    return Clases.ampliar(contexto, resultado);
};

export const incluirClaseCreadaPorId: ProcesarMaestro = async (contexto, payload) => {
    const id = payload as string;
    const clase = await getClaseAlmacenamiento(id);
    return {
        ...contexto,
        estado: "INICIAL" as EstadoMaestroClaseAlmacenamiento,
        clases: {
            ...contexto.clases,
            lista: [clase, ...contexto.clases.lista],
            total: contexto.clases.total + 1,
            activo: clase.id,
        },
    };
};

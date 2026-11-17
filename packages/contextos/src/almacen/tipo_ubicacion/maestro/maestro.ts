import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { TipoUbicacion } from "../diseño.ts";
import { getTipoUbicacion, getTiposUbicacion } from "../infraestructura.ts";
import { ContextoMaestroTipoUbicacion, EstadoMaestroTipoUbicacion } from "./maquina.ts";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroTipoUbicacion, ContextoMaestroTipoUbicacion>;

const conTipos = (fn: ProcesarListaActivaEntidades<TipoUbicacion>) =>
    (ctx: ContextoMaestroTipoUbicacion) => ({ ...ctx, tiposUbicacion: fn(ctx.tiposUbicacion) });

export const TiposUbicacion = accionesListaActivaEntidades(conTipos);

export const recargarTiposUbicacion: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getTiposUbicacion(criteria);
    return TiposUbicacion.recargar(contexto, resultado);
};

export const ampliarTiposUbicacion: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getTiposUbicacion(criteria);
    return TiposUbicacion.ampliar(contexto, resultado);
};

export const incluirTipoUbicacionCreadoPorId: ProcesarMaestro = async (contexto, payload) => {
    const id = payload as string;
    const tipo = await getTipoUbicacion(id);
    return {
        ...contexto,
        estado: "INICIAL" as EstadoMaestroTipoUbicacion,
        tiposUbicacion: {
            ...contexto.tiposUbicacion,
            lista: [tipo, ...contexto.tiposUbicacion.lista],
            total: contexto.tiposUbicacion.total + 1,
            activo: tipo.id,
        },
    };
};

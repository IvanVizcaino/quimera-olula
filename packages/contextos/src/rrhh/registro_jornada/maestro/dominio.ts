import { Criteria, ProcesarContexto } from "@olula/lib/diseño.js";
import { ProcesarListaActivaEntidades, accionesListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { RegistroJornada } from "../diseño.ts";
import { puedeAprobarse } from "../dominio.ts";
import { getJornada, getJornadas, patchAprobarJornada } from "../infraestructura.ts";
import { ContextoMaestroJornadas, EstadoMaestroJornadas } from "./diseño.ts";

type ProcesarJornadas = ProcesarContexto<EstadoMaestroJornadas, ContextoMaestroJornadas>;

const conJornadas = (fn: ProcesarListaActivaEntidades<RegistroJornada>) =>
    (ctx: ContextoMaestroJornadas) => ({ ...ctx, jornadas: fn(ctx.jornadas) });

export const Jornadas = accionesListaActivaEntidades(conJornadas);

export const recargarJornadas: ProcesarJornadas = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getJornadas(criteria.filtro, criteria.orden, criteria.paginacion);
    const nuevoContexto = await Jornadas.recargar(contexto, resultado) as ContextoMaestroJornadas;
    return { ...nuevoContexto, mediaMinutos: resultado.mediaMinutos };
};

export const ampliarJornadas: ProcesarJornadas = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getJornadas(criteria.filtro, criteria.orden, criteria.paginacion);
    const nuevoContexto = await Jornadas.ampliar(contexto, resultado) as ContextoMaestroJornadas;
    return { ...nuevoContexto, mediaMinutos: resultado.mediaMinutos };
};

export const jornadaCreada: ProcesarJornadas = async (contexto, payload) => {
    const idJornada = payload as string;
    const jornada = await getJornada(idJornada);
    return {
        ...contexto,
        estado: "INICIAL" as EstadoMaestroJornadas,
        jornadas: {
            lista: [jornada, ...contexto.jornadas.lista],
            activo: jornada.id,
            total: contexto.jornadas.total + 1,
            criteria: contexto.jornadas.criteria,
        },
    };
};

export const todasPuedenAprobarse = (ids: string[], jornadas: RegistroJornada[]): boolean => {
    if (ids.length === 0) return false;
    return ids.every(id => {
        const jornada = jornadas.find(j => j.id === id);
        return jornada !== undefined && puedeAprobarse(jornada);
    });
};

export const aprobarJornadas: ProcesarJornadas = async (contexto) => {
    await patchAprobarJornada(contexto.seleccionadas);
    const resultado = await getJornadas(
        contexto.jornadas.criteria.filtro,
        contexto.jornadas.criteria.orden,
        contexto.jornadas.criteria.paginacion
    );
    const nuevoContexto = await Jornadas.recargar(contexto, resultado) as ContextoMaestroJornadas;
    return { ...nuevoContexto, estado: "INICIAL" as EstadoMaestroJornadas, mediaMinutos: resultado.mediaMinutos, seleccionadas: [] };
};

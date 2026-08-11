import { Criteria, ProcesarContexto } from "@olula/lib/diseño.js";
import { ProcesarListaActivaEntidades, accionesListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { formatearHoraDate } from "@olula/lib/dominio.js";
import { RegistroJornada } from "../diseño.ts";
import { getJornada, getJornadas, postJornada } from "../infraestructura.ts";
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

export const iniciarJornada: ProcesarJornadas = async (contexto) => {
    const ahora = new Date();
    const idJornada = await postJornada({
        fecha: ahora.toISOString().split("T")[0],
        horaEntrada: formatearHoraDate(ahora),
        horaSalida: null,
        observaciones: null,
    });
    return jornadaCreada(contexto, idJornada);
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

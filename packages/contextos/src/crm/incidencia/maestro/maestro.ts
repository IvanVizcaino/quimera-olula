import { MetaTabla } from "@olula/componentes/index.js";
import { ClausulaFiltro, Criteria, ProcesarContexto } from "@olula/lib/diseño.js";
import {
    accionesListaActivaEntidades,
    ProcesarListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { Incidencia } from "../diseño.ts";
import { getIncidencias } from "../infraestructura.ts";
import { ContextoMaestroIncidencias, EstadoMaestroIncidencias } from "./diseño.ts";

export const metaTablaIncidencia: MetaTabla<Incidencia> = [
    { id: "id", cabecera: "Código" },
    { id: "descripcion", cabecera: "Descripcion" },
    { id: "nombre", cabecera: "Nombre" },
    { id: "estado", cabecera: "Estado" },
    { id: "prioridad", cabecera: "Prioridad" },
];

export const estadosIncidenciaOcultosPorDefecto = ["rechazada", "cerrada"];

export const crearFiltroEstadoIncidencia = (
    valor: unknown
): ClausulaFiltro | null => {
    const valores = Array.isArray(valor)
        ? valor.map(String).filter(Boolean)
        : typeof valor === "string"
            ? valor
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean)
            : [];

    if (!valores.length) return null;

    return ["estado", "in", valores as unknown as string] as ClausulaFiltro;
};

type ProcesarIncidencias = ProcesarContexto<EstadoMaestroIncidencias, ContextoMaestroIncidencias>;

const conIncidencias =
    (fn: ProcesarListaActivaEntidades<Incidencia>) =>
        (ctx: ContextoMaestroIncidencias) => ({ ...ctx, incidencias: fn(ctx.incidencias) });

export const Incidencias = accionesListaActivaEntidades(conIncidencias);

export const recargarIncidencias: ProcesarIncidencias = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getIncidencias(criteria.filtro, criteria.orden, criteria.paginacion);

    return Incidencias.recargar(contexto, resultado);
}

export const ampliarIncidencias: ProcesarIncidencias = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getIncidencias(criteria.filtro, criteria.orden, criteria.paginacion);

    return Incidencias.ampliar(contexto, resultado);
}

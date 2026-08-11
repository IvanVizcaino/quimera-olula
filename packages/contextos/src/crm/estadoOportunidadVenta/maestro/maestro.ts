import { MetaTabla } from "@olula/componentes/index.js";
import { Criteria, ProcesarContexto } from "@olula/lib/diseño.js";
import {
    ProcesarListaActivaEntidades,
    accionesListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { EstadoOportunidad } from "../diseño.ts";
import { getEstadosOportunidad } from "../infraestructura.ts";
import { ContextoMaestroEstadosOportunidad, EstadoMaestroEstadosOportunidad } from "./diseño.ts";

export const metaTablaEstadoOportunidad: MetaTabla<EstadoOportunidad> = [
    { id: "id", cabecera: "Código" },
    { id: "descripcion", cabecera: "Descripción" },
    { id: "estadobase", cabecera: "Estado Base" },
    { id: "probabilidad", cabecera: "Probabilidad", tipo: "numero" },
];

type ProcesarEstadosOportunidad = ProcesarContexto<EstadoMaestroEstadosOportunidad, ContextoMaestroEstadosOportunidad>;

const conEstadosOportunidad =
    (fn: ProcesarListaActivaEntidades<EstadoOportunidad>) =>
        (ctx: ContextoMaestroEstadosOportunidad) => ({ ...ctx, estados_oportunidad: fn(ctx.estados_oportunidad) });

export const EstadosOportunidad = accionesListaActivaEntidades(conEstadosOportunidad);

export const recargarEstadosOportunidad: ProcesarEstadosOportunidad = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getEstadosOportunidad(criteria.filtro, criteria.orden, criteria.paginacion);

    return EstadosOportunidad.recargar(contexto, resultado);
}
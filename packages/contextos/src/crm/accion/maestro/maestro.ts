import { MetaTabla } from "@olula/componentes/index.js";
import { Criteria, ProcesarContexto } from "@olula/lib/diseño.js";
import {
    ProcesarListaActivaEntidades,
    accionesListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { Accion } from "../diseño.ts";
import { finalizarAccion, getAcciones } from "../infraestructura.ts";
import { ContextoMaestroAcciones, EstadoMaestroAcciones } from "./diseño.ts";

export const metaTablaAccion: MetaTabla<Accion> = [
    { id: "id", cabecera: "Código" },
    { id: "fecha", cabecera: "Fecha", tipo: "fecha" },
    { id: "descripcion", cabecera: "Descripción" },
    { id: "tipo", cabecera: "Tipo" },
    { id: "estado", cabecera: "Estado" },
];

type ProcesarAcciones = ProcesarContexto<EstadoMaestroAcciones, ContextoMaestroAcciones>;

const conAcciones =
    (fn: ProcesarListaActivaEntidades<Accion>) =>
        (ctx: ContextoMaestroAcciones) => ({ ...ctx, acciones: fn(ctx.acciones) });

export const Acciones = accionesListaActivaEntidades(conAcciones);

export const recargarAcciones: ProcesarAcciones = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getAcciones(criteria.filtro, criteria.orden, criteria.paginacion);

    return Acciones.recargar(contexto, resultado);
}

export const ampliarAcciones: ProcesarAcciones = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getAcciones(criteria.filtro, criteria.orden, criteria.paginacion);

    return Acciones.ampliar(contexto, resultado);
}

export const finalizarAccionRapida: ProcesarAcciones = async (contexto, payload) => {
    const accionId = payload as string;
    await finalizarAccion(accionId);

    return Acciones.quitar(contexto, accionId);
}

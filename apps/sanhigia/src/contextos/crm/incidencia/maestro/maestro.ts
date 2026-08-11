import { MetaTabla } from "@olula/componentes/index.js";
import { Criteria, ProcesarContexto } from "@olula/lib/diseño.js";
import {
    accionesListaActivaEntidades,
    ProcesarListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { Incidencia } from "../diseño.ts";
import { getIncidencias } from "../infraestructura.ts";
import { ContextoMaestroIncidencias, EstadoMaestroIncidencias } from "./diseño.ts";

export const metaTablaIncidencia: MetaTabla<Incidencia> = [
    { id: "descripcion", cabecera: "Descripción", tipo: "texto" },
    { id: "nombre_causante", cabecera: "Causante", render: (i: Incidencia) => i.nombreCausante },
    { id: "fecha", cabecera: "Fecha", tipo: "fecha" },
    // {
    //     id: "tipoIncidencia",
    //     cabecera: "Tipo",
    //     render: (i: Incidencia) => i.tipoIncidencia === "Transportista" ? "Transporte" : "Producto",
    // },
];

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

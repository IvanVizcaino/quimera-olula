import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import {
    accionesListaActivaEntidades,
    ProcesarListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { Articulo } from "../diseño.ts";
import { getArticulos } from "../infraestructura.ts";
import { ContextoMaestroArticulo, EstadoMaestroArticulo } from "./diseño.ts";

export type ProcesarMaestroArticulo = ProcesarContexto<
    EstadoMaestroArticulo,
    ContextoMaestroArticulo
>;

const conArticulos =
    (fn: ProcesarListaActivaEntidades<Articulo>) =>
        (ctx: ContextoMaestroArticulo) => ({ ...ctx, articulos: fn(ctx.articulos) });

export const Articulos = accionesListaActivaEntidades(conArticulos);

export const recargarArticulos: ProcesarMaestroArticulo = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getArticulos(criteria.filtro, criteria.orden, criteria.paginacion);
    return Articulos.recargar(contexto, resultado);
};

export const ampliarArticulos: ProcesarMaestroArticulo = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getArticulos(criteria.filtro, criteria.orden, criteria.paginacion);
    return Articulos.ampliar(contexto, resultado);
};

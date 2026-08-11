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
    const datos = await getArticulos(criteria.filtro, criteria.orden);
    return Articulos.recargar(contexto, { datos, total: datos.length });
};

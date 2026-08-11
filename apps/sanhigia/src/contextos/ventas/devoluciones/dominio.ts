import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import {
    accionesListaActivaEntidades,
    ProcesarListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { ContextoMaestroDevolucionesPedidos, DevolucionPedido, EstadoMaestroDevolucionesPedidos } from "./diseño.ts";
import { getDevolucionesPedidos } from "./infraestructura.ts";

export type ProcesarMaestroDevolucionesPedidos = ProcesarContexto<
    EstadoMaestroDevolucionesPedidos,
    ContextoMaestroDevolucionesPedidos
>;

const conDevoluciones =
    (fn: ProcesarListaActivaEntidades<DevolucionPedido>) =>
        (ctx: ContextoMaestroDevolucionesPedidos) => ({
            ...ctx,
            devoluciones: fn(ctx.devoluciones),
        });

export const Devoluciones = accionesListaActivaEntidades(conDevoluciones);

export const recargarDevolucionesPedidos: ProcesarMaestroDevolucionesPedidos = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getDevolucionesPedidos(
        criteria.filtro,
        criteria.orden,
        criteria.paginacion
    );

    return Devoluciones.recargar(contexto, resultado);
};

export const recargarDevolucionesActuales: ProcesarMaestroDevolucionesPedidos = async (contexto) => {
    const { criteria } = contexto.devoluciones;
    const resultado = await getDevolucionesPedidos(
        criteria.filtro,
        criteria.orden,
        criteria.paginacion
    );

    return Devoluciones.recargar(contexto, resultado);
};

export const ampliarDevolucionesPedidos: ProcesarMaestroDevolucionesPedidos = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getDevolucionesPedidos(
        criteria.filtro,
        criteria.orden,
        criteria.paginacion
    );

    return Devoluciones.ampliar(contexto, resultado);
};

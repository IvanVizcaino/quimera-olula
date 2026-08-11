import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { ItemOrdenAlmacen } from "../../diseño.ts";
import { getOrden, getOrdenes } from "../../infraestructura.ts";
import { ContextoMaestroOrden, EstadoMaestroOrden } from "./maquina.ts";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroOrden, ContextoMaestroOrden>;

const conOrdenes =
    (fn: ProcesarListaActivaEntidades<ItemOrdenAlmacen>) => (ctx: ContextoMaestroOrden) => ({
        ...ctx,
        ordenes: fn(ctx.ordenes),
    });

export const Ordenes = accionesListaActivaEntidades(conOrdenes);

export const recargarOrdenes: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getOrdenes(
        criteria.filtro,
        criteria.orden,
        criteria.paginacion
    );
    return Ordenes.recargar(contexto, resultado);
};

export const ampliarOrdenes: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getOrdenes(
        criteria.filtro,
        criteria.orden,
        criteria.paginacion
    );
    return Ordenes.ampliar(contexto, resultado);
};

export const incluirOrdenCreadaPorId: ProcesarMaestro = async (contexto, payload) => {
    const id = payload as string;
    const orden = await getOrden(id);
    const item: ItemOrdenAlmacen = {
        id: orden.id,
        fecha: orden.fecha,
        tipo: orden.tipo,
        abierta: orden.abierta,
        estado: orden.estado,
        descripcion: orden.descripcion,
        idUbicacionOrigen: orden.idUbicacionOrigen,
        idCajaOrigen: orden.idCajaOrigen,
        idUbicacionDestino: orden.idUbicacionDestino,
        idCajaDestino: orden.idCajaDestino,
    };
    return {
        ...contexto,
        estado: "INICIAL",
        ordenes: {
            ...contexto.ordenes,
            lista: [item, ...contexto.ordenes.lista],
            total: contexto.ordenes.total + 1,
            activo: item.id,
        },
    };
};

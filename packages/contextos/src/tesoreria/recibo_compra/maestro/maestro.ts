import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { postRemesaPago } from "../../remesa_pago/infraestructura.js";
import { ReciboCompra } from "../diseño.js";
import { getRecibosCompra, getTotalesRecibosCompra } from "../infraestructura.js";
import { ContextoMaestroReciboCompra, EstadoMaestroReciboCompra } from "./diseño.js";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroReciboCompra, ContextoMaestroReciboCompra>;

const conRecibos = (fn: ProcesarListaActivaEntidades<ReciboCompra>) =>
    (ctx: ContextoMaestroReciboCompra) => ({ ...ctx, recibos: fn(ctx.recibos) });

export const Recibos = accionesListaActivaEntidades(conRecibos);

export const recargarRecibos: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const [resultado, totales] = await Promise.all([
        getRecibosCompra(criteria),
        getTotalesRecibosCompra(criteria),
    ]);
    const ctx = (await Recibos.recargar(contexto, resultado)) as ContextoMaestroReciboCompra;
    return { ...ctx, totales };
};

export const ampliarRecibos: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getRecibosCompra(criteria);
    return Recibos.ampliar(contexto, resultado);
};

export const seleccionadosCambiados: ProcesarMaestro = async (contexto, payload) => ({
    ...contexto,
    seleccionados: payload as string[],
});

export const recibosSeleccionados = (ids: string[], recibos: ReciboCompra[]): ReciboCompra[] =>
    recibos.filter((recibo) => ids.includes(recibo.id));

export const remesarSeleccionados: ProcesarMaestro = async (contexto, payload) => {
    const cuentaId = payload as string;
    const aRemesar = recibosSeleccionados(contexto.seleccionados, contexto.recibos.lista);

    if (!cuentaId || !aRemesar.length) return { ...contexto, estado: 'INICIAL' };

    const remesaId = await postRemesaPago({
        cuentaId,
        reciboIds: aRemesar.map((recibo) => recibo.id),
    });

    const criteria = contexto.recibos.criteria;
    const [resultado, totales] = await Promise.all([
        getRecibosCompra(criteria),
        getTotalesRecibosCompra(criteria),
    ]);
    const ctx = (await Recibos.recargar(contexto, resultado)) as ContextoMaestroReciboCompra;

    return {
        ...ctx,
        estado: 'INICIAL',
        seleccionados: [],
        totales,
        remesaCreada: remesaId,
    };
};

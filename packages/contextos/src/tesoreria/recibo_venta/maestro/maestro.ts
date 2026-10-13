import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { postRemesa } from "../../remesa/infraestructura.js";
import { ReciboVenta } from "../diseño.js";
import { puedenAgruparse } from "../dominio.js";
import { agruparRecibosVenta, getRecibosVenta, getTotalesRecibosVenta } from "../infraestructura.js";
import { ContextoMaestroReciboVenta, EstadoMaestroReciboVenta } from "./diseño.js";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroReciboVenta, ContextoMaestroReciboVenta>;

const conRecibos = (fn: ProcesarListaActivaEntidades<ReciboVenta>) =>
    (ctx: ContextoMaestroReciboVenta) => ({ ...ctx, recibos: fn(ctx.recibos) });

export const Recibos = accionesListaActivaEntidades(conRecibos);

export const recargarRecibos: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const [resultado, totales] = await Promise.all([
        getRecibosVenta(criteria),
        getTotalesRecibosVenta(criteria),
    ]);
    const ctx = (await Recibos.recargar(contexto, resultado)) as ContextoMaestroReciboVenta;
    return { ...ctx, totales };
};

export const ampliarRecibos: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getRecibosVenta(criteria);
    return Recibos.ampliar(contexto, resultado);
};

export const recargarRecibosActual: ProcesarMaestro = async (contexto) => {
    const criteria = contexto.recibos.criteria;
    const [resultado, totales] = await Promise.all([
        getRecibosVenta(criteria),
        getTotalesRecibosVenta(criteria),
    ]);
    const ctx = (await Recibos.recargar(contexto, resultado)) as ContextoMaestroReciboVenta;
    return { ...ctx, totales };
};

export const seleccionadosCambiados: ProcesarMaestro = async (contexto, payload) => ({
    ...contexto,
    seleccionados: payload as string[],
});

export const recibosSeleccionados = (ids: string[], recibos: ReciboVenta[]): ReciboVenta[] =>
    recibos.filter((recibo) => ids.includes(recibo.id));

export const agruparSeleccionados: ProcesarMaestro = async (contexto) => {
    const aAgrupar = recibosSeleccionados(contexto.seleccionados, contexto.recibos.lista);

    if (!puedenAgruparse(aAgrupar)) return { ...contexto, estado: 'INICIAL' };

    const ids = aAgrupar.map((recibo) => recibo.id);
    const grupoId = await agruparRecibosVenta(ids[0], ids);

    const criteria = contexto.recibos.criteria;
    const [resultado, totales] = await Promise.all([
        getRecibosVenta(criteria),
        getTotalesRecibosVenta(criteria),
    ]);
    const recargado = (await Recibos.recargar(
        { ...contexto, estado: 'INICIAL', seleccionados: [], totales },
        resultado
    )) as ContextoMaestroReciboVenta;

    return Recibos.activar(recargado, grupoId);
};

export const remesarSeleccionados: ProcesarMaestro = async (contexto, payload) => {
    const cuentaId = payload as string;
    const aRemesar = recibosSeleccionados(contexto.seleccionados, contexto.recibos.lista);

    if (!cuentaId || !aRemesar.length) return { ...contexto, estado: 'INICIAL' };

    const remesaId = await postRemesa({
        cuentaId,
        reciboIds: aRemesar.map((recibo) => recibo.id),
    });

    return {
        ...contexto,
        estado: 'INICIAL',
        seleccionados: [],
        remesaCreada: remesaId,
    };
};

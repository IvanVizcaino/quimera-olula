import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Amortizacion } from "../diseño.ts";
import { getAmortizacion, getAmortizaciones } from "../infraestructura.ts";
import { ContextoMaestroAmortizacion, EstadoMaestroAmortizacion } from "./diseño.ts";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroAmortizacion, ContextoMaestroAmortizacion>;

const conAmortizaciones = (fn: ProcesarListaActivaEntidades<Amortizacion>) =>
    (ctx: ContextoMaestroAmortizacion) => ({ ...ctx, amortizaciones: fn(ctx.amortizaciones) });

export const Amortizaciones = accionesListaActivaEntidades(conAmortizaciones);

export const recargarAmortizaciones: ProcesarMaestro = async (contexto, payload) => {
    const criteria = (payload as Criteria | undefined) ?? contexto.amortizaciones.criteria;
    const resultado = await getAmortizaciones(criteria);
    return Amortizaciones.recargar(contexto, resultado);
};

export const ampliarAmortizaciones: ProcesarMaestro = async (contexto, payload) => {
    const resultado = await getAmortizaciones(payload as Criteria);
    return Amortizaciones.ampliar(contexto, resultado);
};

export const incluirAmortizacionCreadaPorId: ProcesarMaestro = async (contexto, payload) => {
    const amortizacion = await getAmortizacion(payload as string);
    return {
        ...contexto,
        estado: "INICIAL",
        amortizaciones: {
            ...contexto.amortizaciones,
            lista: [amortizacion, ...contexto.amortizaciones.lista],
            total: contexto.amortizaciones.total + 1,
            activo: amortizacion.id,
        },
    };
};

/** Tras generar o deshacer dotaciones cambian los totales de muchas fichas:
 * se recarga la lista y se cierra el detalle. */
export const terminarProceso: ProcesarMaestro = async (contexto) => {
    const { datos, total } = await getAmortizaciones(contexto.amortizaciones.criteria);
    return {
        ...contexto,
        estado: "INICIAL",
        amortizaciones: { ...contexto.amortizaciones, lista: datos, total, activo: undefined },
    };
};

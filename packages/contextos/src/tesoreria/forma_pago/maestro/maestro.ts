import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { FormaPago } from "../diseño.ts";
import { getFormaPago, getFormasPago } from "../infraestructura.ts";
import { ContextoMaestroFormaPago, EstadoMaestroFormaPago } from "./diseño.ts";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroFormaPago, ContextoMaestroFormaPago>;

const conFormasPago = (fn: ProcesarListaActivaEntidades<FormaPago>) =>
    (ctx: ContextoMaestroFormaPago) => ({
        ...ctx,
        formasPago: fn(ctx.formasPago),
    });

export const FormasPago = accionesListaActivaEntidades(conFormasPago);

export const recargarFormasPago: ProcesarMaestro = async (contexto, payload) => {
    const criteria = (payload as Criteria | undefined) ?? contexto.formasPago.criteria;
    const resultado = await getFormasPago(criteria);
    return FormasPago.recargar(contexto, resultado);
};

export const ampliarFormasPago: ProcesarMaestro = async (contexto, payload) => {
    const resultado = await getFormasPago(payload as Criteria);
    return FormasPago.ampliar(contexto, resultado);
};

export const incluirFormaPagoCreadaPorId: ProcesarMaestro = async (contexto, payload) => {
    const formaPago = await getFormaPago(payload as string);
    return {
        ...contexto,
        estado: "INICIAL",
        formasPago: {
            ...contexto.formasPago,
            lista: [formaPago, ...contexto.formasPago.lista],
            total: contexto.formasPago.total + 1,
            activo: formaPago.id,
        },
    };
};

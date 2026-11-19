import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { AlcanceRegeneracion, CodigoBalance } from "../diseño.ts";
import { getCodigoBalance, getCodigosBalance } from "../infraestructura.ts";
import { ContextoMaestroCodigoBalance, EstadoMaestroCodigoBalance } from "./diseño.ts";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroCodigoBalance, ContextoMaestroCodigoBalance>;

const conCodigosBalance = (fn: ProcesarListaActivaEntidades<CodigoBalance>) =>
    (ctx: ContextoMaestroCodigoBalance) => ({
        ...ctx,
        codigosBalance: fn(ctx.codigosBalance),
    });

export const CodigosBalance = accionesListaActivaEntidades(conCodigosBalance);

export const recargarCodigosBalance: ProcesarMaestro = async (contexto, payload) => {
    const criteria = (payload as Criteria | undefined) ?? contexto.codigosBalance.criteria;
    const resultado = await getCodigosBalance(criteria);
    return CodigosBalance.recargar(contexto, resultado);
};

export const ampliarCodigosBalance: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getCodigosBalance(criteria);
    return CodigosBalance.ampliar(contexto, resultado);
};

export const incluirCodigoBalanceCreadoPorId: ProcesarMaestro = async (contexto, payload) => {
    const id = payload as string;
    const codigo = await getCodigoBalance(id);
    return {
        ...contexto,
        estado: "INICIAL",
        codigosBalance: {
            ...contexto.codigosBalance,
            lista: [codigo, ...contexto.codigosBalance.lista],
            total: contexto.codigosBalance.total + 1,
            activo: codigo.id,
        },
    };
};

export const pedirRegeneracion: ProcesarMaestro = async (contexto, payload) => ({
    ...contexto,
    estado: "REGENERANDO",
    alcanceRegeneracion: payload as AlcanceRegeneracion,
});

/** Tras regenerar los códigos pueden haber cambiado todos: se recarga la
 * lista y se cierra el detalle. */
export const terminarRegeneracion: ProcesarMaestro = async (contexto) => {
    const { datos, total } = await getCodigosBalance(contexto.codigosBalance.criteria);
    return {
        ...contexto,
        estado: "INICIAL",
        alcanceRegeneracion: null,
        codigosBalance: { ...contexto.codigosBalance, lista: datos, total, activo: undefined },
    };
};

export const cancelarRegeneracion: ProcesarMaestro = async (contexto) => ({
    ...contexto,
    estado: "INICIAL",
    alcanceRegeneracion: null,
});

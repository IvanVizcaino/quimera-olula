import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Banco } from "../diseño.ts";
import { getBanco, getBancos } from "../infraestructura.ts";
import { ContextoMaestroBanco, EstadoMaestroBanco } from "./diseño.ts";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroBanco, ContextoMaestroBanco>;

const conBancos = (fn: ProcesarListaActivaEntidades<Banco>) =>
    (ctx: ContextoMaestroBanco) => ({
        ...ctx,
        bancos: fn(ctx.bancos),
    });

export const Bancos = accionesListaActivaEntidades(conBancos);

export const recargarBancos: ProcesarMaestro = async (contexto, payload) => {
    const criteria = (payload as Criteria | undefined) ?? contexto.bancos.criteria;
    const resultado = await getBancos(criteria);
    return Bancos.recargar(contexto, resultado);
};

export const ampliarBancos: ProcesarMaestro = async (contexto, payload) => {
    const resultado = await getBancos(payload as Criteria);
    return Bancos.ampliar(contexto, resultado);
};

export const incluirBancoCreadoPorId: ProcesarMaestro = async (contexto, payload) => {
    const banco = await getBanco(payload as string);
    return {
        ...contexto,
        estado: "INICIAL",
        bancos: {
            ...contexto.bancos,
            lista: [banco, ...contexto.bancos.lista],
            total: contexto.bancos.total + 1,
            activo: banco.id,
        },
    };
};

import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Divisa } from "../diseño.ts";
import { getDivisa, getDivisasMaestro } from "../infraestructura.ts";
import { ContextoMaestroDivisa, EstadoMaestroDivisa } from "./diseño.ts";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroDivisa, ContextoMaestroDivisa>;

const conDivisas = (fn: ProcesarListaActivaEntidades<Divisa>) =>
    (ctx: ContextoMaestroDivisa) => ({
        ...ctx,
        divisas: fn(ctx.divisas),
    });

export const Divisas = accionesListaActivaEntidades(conDivisas);

export const recargarDivisas: ProcesarMaestro = async (contexto, payload) => {
    const criteria = (payload as Criteria | undefined) ?? contexto.divisas.criteria;
    const resultado = await getDivisasMaestro(criteria);
    return Divisas.recargar(contexto, resultado);
};

export const ampliarDivisas: ProcesarMaestro = async (contexto, payload) => {
    const resultado = await getDivisasMaestro(payload as Criteria);
    return Divisas.ampliar(contexto, resultado);
};

export const incluirDivisaCreadoPorId: ProcesarMaestro = async (contexto, payload) => {
    const divisa = await getDivisa(payload as string);
    return {
        ...contexto,
        estado: "INICIAL",
        divisas: {
            ...contexto.divisas,
            lista: [divisa, ...contexto.divisas.lista],
            total: contexto.divisas.total + 1,
            activo: divisa.id,
        },
    };
};

import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Pais } from "../diseño.ts";
import { getPais, getPaisesMaestro } from "../infraestructura.ts";
import { ContextoMaestroPais, EstadoMaestroPais } from "./diseño.ts";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroPais, ContextoMaestroPais>;

const conPaises = (fn: ProcesarListaActivaEntidades<Pais>) =>
    (ctx: ContextoMaestroPais) => ({
        ...ctx,
        paises: fn(ctx.paises),
    });

export const Paises = accionesListaActivaEntidades(conPaises);

export const recargarPaises: ProcesarMaestro = async (contexto, payload) => {
    const criteria = (payload as Criteria | undefined) ?? contexto.paises.criteria;
    const resultado = await getPaisesMaestro(criteria);
    return Paises.recargar(contexto, resultado);
};

export const ampliarPaises: ProcesarMaestro = async (contexto, payload) => {
    const resultado = await getPaisesMaestro(payload as Criteria);
    return Paises.ampliar(contexto, resultado);
};

export const incluirPaisCreadoPorId: ProcesarMaestro = async (contexto, payload) => {
    const pais = await getPais(payload as string);
    return {
        ...contexto,
        estado: "INICIAL",
        paises: {
            ...contexto.paises,
            lista: [pais, ...contexto.paises.lista],
            total: contexto.paises.total + 1,
            activo: pais.id,
        },
    };
};

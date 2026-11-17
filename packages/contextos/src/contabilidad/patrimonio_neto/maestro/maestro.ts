import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import {
    accionesListaActivaEntidades,
    ProcesarListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { PatrimonioNeto } from "../diseño.ts";
import {
    getPatrimonioNeto,
    getListaPatrimonioNeto,
} from "../infraestructura.ts";
import {
    ContextoMaestroPatrimonioNeto,
    EstadoMaestroPatrimonioNeto,
} from "./diseño.ts";

type ProcesarMaestro = ProcesarContexto<
    EstadoMaestroPatrimonioNeto,
    ContextoMaestroPatrimonioNeto
>;

const conInformes =
    (fn: ProcesarListaActivaEntidades<PatrimonioNeto>) =>
    (ctx: ContextoMaestroPatrimonioNeto) => ({
        ...ctx,
        informes: fn(ctx.informes),
    });

export const Informes = accionesListaActivaEntidades(conInformes);

export const recargarInformes: ProcesarMaestro = async (contexto, payload) => {
    const resultado = await getListaPatrimonioNeto(payload as Criteria);
    return Informes.recargar(contexto, resultado);
};

export const ampliarInformes: ProcesarMaestro = async (contexto, payload) => {
    const resultado = await getListaPatrimonioNeto(payload as Criteria);
    return Informes.ampliar(contexto, resultado);
};

export const incluirInformeCreadoPorId: ProcesarMaestro = async (
    contexto,
    payload
) => {
    const informe = await getPatrimonioNeto(payload as string);
    return {
        ...contexto,
        estado: "INICIAL",
        informes: {
            ...contexto.informes,
            lista: [informe, ...contexto.informes.lista],
            total: contexto.informes.total + 1,
            activo: informe.id,
        },
    };
};

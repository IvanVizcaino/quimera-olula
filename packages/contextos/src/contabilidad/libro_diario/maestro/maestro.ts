import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import {
    accionesListaActivaEntidades,
    ProcesarListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { LibroDiario } from "../diseño.ts";
import { getLibroDiario, getListaLibroDiario } from "../infraestructura.ts";
import {
    ContextoMaestroLibroDiario,
    EstadoMaestroLibroDiario,
} from "./diseño.ts";

type ProcesarMaestro = ProcesarContexto<
    EstadoMaestroLibroDiario,
    ContextoMaestroLibroDiario
>;

const conInformes =
    (fn: ProcesarListaActivaEntidades<LibroDiario>) =>
    (ctx: ContextoMaestroLibroDiario) => ({
        ...ctx,
        informes: fn(ctx.informes),
    });

export const Informes = accionesListaActivaEntidades(conInformes);

export const recargarInformes: ProcesarMaestro = async (contexto, payload) => {
    const resultado = await getListaLibroDiario(payload as Criteria);
    return Informes.recargar(contexto, resultado);
};

export const ampliarInformes: ProcesarMaestro = async (contexto, payload) => {
    const resultado = await getListaLibroDiario(payload as Criteria);
    return Informes.ampliar(contexto, resultado);
};

export const incluirInformeCreadoPorId: ProcesarMaestro = async (
    contexto,
    payload
) => {
    const informe = await getLibroDiario(payload as string);
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

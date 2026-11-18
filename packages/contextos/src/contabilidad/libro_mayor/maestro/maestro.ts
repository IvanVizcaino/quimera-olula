import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import {
    accionesListaActivaEntidades,
    ProcesarListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { LibroMayor } from "../diseño.ts";
import { getLibroMayor, getListaLibroMayor } from "../infraestructura.ts";
import {
    ContextoMaestroLibroMayor,
    EstadoMaestroLibroMayor,
} from "./diseño.ts";

type ProcesarMaestro = ProcesarContexto<
    EstadoMaestroLibroMayor,
    ContextoMaestroLibroMayor
>;

const conInformes =
    (fn: ProcesarListaActivaEntidades<LibroMayor>) =>
    (ctx: ContextoMaestroLibroMayor) => ({
        ...ctx,
        informes: fn(ctx.informes),
    });

export const Informes = accionesListaActivaEntidades(conInformes);

export const recargarInformes: ProcesarMaestro = async (contexto, payload) => {
    const resultado = await getListaLibroMayor(payload as Criteria);
    return Informes.recargar(contexto, resultado);
};

export const ampliarInformes: ProcesarMaestro = async (contexto, payload) => {
    const resultado = await getListaLibroMayor(payload as Criteria);
    return Informes.ampliar(contexto, resultado);
};

export const incluirInformeCreadoPorId: ProcesarMaestro = async (
    contexto,
    payload
) => {
    const informe = await getLibroMayor(payload as string);
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

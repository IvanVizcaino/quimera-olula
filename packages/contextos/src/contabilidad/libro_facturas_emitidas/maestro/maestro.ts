import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import {
    accionesListaActivaEntidades,
    ProcesarListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { LibroFacturasEmitidas } from "../diseño.ts";
import {
    getLibroFacturasEmitidas,
    getListaLibroFacturasEmitidas,
} from "../infraestructura.ts";
import {
    ContextoMaestroLibroFacturasEmitidas,
    EstadoMaestroLibroFacturasEmitidas,
} from "./diseño.ts";

type ProcesarMaestro = ProcesarContexto<
    EstadoMaestroLibroFacturasEmitidas,
    ContextoMaestroLibroFacturasEmitidas
>;

const conInformes =
    (fn: ProcesarListaActivaEntidades<LibroFacturasEmitidas>) =>
    (ctx: ContextoMaestroLibroFacturasEmitidas) => ({
        ...ctx,
        informes: fn(ctx.informes),
    });

export const Informes = accionesListaActivaEntidades(conInformes);

export const recargarInformes: ProcesarMaestro = async (contexto, payload) => {
    const resultado = await getListaLibroFacturasEmitidas(payload as Criteria);
    return Informes.recargar(contexto, resultado);
};

export const ampliarInformes: ProcesarMaestro = async (contexto, payload) => {
    const resultado = await getListaLibroFacturasEmitidas(payload as Criteria);
    return Informes.ampliar(contexto, resultado);
};

export const incluirInformeCreadoPorId: ProcesarMaestro = async (
    contexto,
    payload
) => {
    const informe = await getLibroFacturasEmitidas(payload as string);
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

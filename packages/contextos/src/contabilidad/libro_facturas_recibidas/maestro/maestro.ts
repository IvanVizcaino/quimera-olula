import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import {
    accionesListaActivaEntidades,
    ProcesarListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { LibroFacturasRecibidas } from "../diseño.ts";
import {
    getLibroFacturasRecibidas,
    getListaLibroFacturasRecibidas,
} from "../infraestructura.ts";
import {
    ContextoMaestroLibroFacturasRecibidas,
    EstadoMaestroLibroFacturasRecibidas,
} from "./diseño.ts";

type ProcesarMaestro = ProcesarContexto<
    EstadoMaestroLibroFacturasRecibidas,
    ContextoMaestroLibroFacturasRecibidas
>;

const conInformes =
    (fn: ProcesarListaActivaEntidades<LibroFacturasRecibidas>) =>
    (ctx: ContextoMaestroLibroFacturasRecibidas) => ({
        ...ctx,
        informes: fn(ctx.informes),
    });

export const Informes = accionesListaActivaEntidades(conInformes);

export const recargarInformes: ProcesarMaestro = async (contexto, payload) => {
    const resultado = await getListaLibroFacturasRecibidas(payload as Criteria);
    return Informes.recargar(contexto, resultado);
};

export const ampliarInformes: ProcesarMaestro = async (contexto, payload) => {
    const resultado = await getListaLibroFacturasRecibidas(payload as Criteria);
    return Informes.ampliar(contexto, resultado);
};

export const incluirInformeCreadoPorId: ProcesarMaestro = async (
    contexto,
    payload
) => {
    const informe = await getLibroFacturasRecibidas(payload as string);
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

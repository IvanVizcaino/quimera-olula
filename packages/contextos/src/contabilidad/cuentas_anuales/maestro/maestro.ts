import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import {
    accionesListaActivaEntidades,
    ProcesarListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { CuentasAnuales } from "../diseño.ts";
import {
    getCuentasAnuales,
    getListaCuentasAnuales,
} from "../infraestructura.ts";
import {
    ContextoMaestroCuentasAnuales,
    EstadoMaestroCuentasAnuales,
} from "./diseño.ts";

type ProcesarMaestro = ProcesarContexto<
    EstadoMaestroCuentasAnuales,
    ContextoMaestroCuentasAnuales
>;

const conInformes =
    (fn: ProcesarListaActivaEntidades<CuentasAnuales>) =>
    (ctx: ContextoMaestroCuentasAnuales) => ({
        ...ctx,
        informes: fn(ctx.informes),
    });

export const Informes = accionesListaActivaEntidades(conInformes);

export const recargarInformes: ProcesarMaestro = async (contexto, payload) => {
    const resultado = await getListaCuentasAnuales(payload as Criteria);
    return Informes.recargar(contexto, resultado);
};

export const ampliarInformes: ProcesarMaestro = async (contexto, payload) => {
    const resultado = await getListaCuentasAnuales(payload as Criteria);
    return Informes.ampliar(contexto, resultado);
};

export const incluirInformeCreadoPorId: ProcesarMaestro = async (
    contexto,
    payload
) => {
    const informe = await getCuentasAnuales(payload as string);
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

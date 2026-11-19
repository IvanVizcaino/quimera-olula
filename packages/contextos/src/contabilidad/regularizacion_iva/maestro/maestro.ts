import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { RegularizacionIva } from "../diseño.ts";
import {
    getRegularizacionesIva,
    getRegularizacionIva,
} from "../infraestructura.ts";
import {
    ContextoMaestroRegularizacionIva,
    EstadoMaestroRegularizacionIva,
} from "./diseño.ts";

type ProcesarMaestro = ProcesarContexto<
    EstadoMaestroRegularizacionIva,
    ContextoMaestroRegularizacionIva
>;

const conRegularizaciones = (
    fn: ProcesarListaActivaEntidades<RegularizacionIva>
) => (ctx: ContextoMaestroRegularizacionIva) => ({
    ...ctx,
    regularizaciones: fn(ctx.regularizaciones),
});

export const Regularizaciones = accionesListaActivaEntidades(conRegularizaciones);

export const recargarRegularizaciones: ProcesarMaestro = async (
    contexto,
    payload
) => {
    const resultado = await getRegularizacionesIva(payload as Criteria);
    return Regularizaciones.recargar(contexto, resultado);
};

export const ampliarRegularizaciones: ProcesarMaestro = async (
    contexto,
    payload
) => {
    const resultado = await getRegularizacionesIva(payload as Criteria);
    return Regularizaciones.ampliar(contexto, resultado);
};

export const incluirRegularizacionCreadaPorId: ProcesarMaestro = async (
    contexto,
    payload
) => {
    const regularizacion = await getRegularizacionIva(payload as string);
    return {
        ...contexto,
        estado: "INICIAL",
        regularizaciones: {
            ...contexto.regularizaciones,
            lista: [regularizacion, ...contexto.regularizaciones.lista],
            total: contexto.regularizaciones.total + 1,
            activo: regularizacion.id,
        },
    };
};

import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { RemesaPago } from "../diseño.js";
import { getRemesasPago, postRemesaPago } from "../infraestructura.js";
import { ContextoMaestroRemesaPago, EstadoMaestroRemesaPago, NuevaRemesaNominas } from "./diseño.js";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroRemesaPago, ContextoMaestroRemesaPago>;

const conRemesas = (fn: ProcesarListaActivaEntidades<RemesaPago>) =>
    (ctx: ContextoMaestroRemesaPago) => ({ ...ctx, remesas: fn(ctx.remesas) });

export const Remesas = accionesListaActivaEntidades(conRemesas);

export const recargarRemesas: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getRemesasPago(criteria);
    return Remesas.recargar(contexto, resultado);
};

export const ampliarRemesas: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getRemesasPago(criteria);
    return Remesas.ampliar(contexto, resultado);
};

export const crearRemesaNominas: ProcesarMaestro = async (contexto, payload) => {
    const nueva = payload as NuevaRemesaNominas;

    const remesaId = await postRemesaPago({ ...nueva, reciboIds: [] });

    const resultado = await getRemesasPago(contexto.remesas.criteria);
    const recargado = (await Remesas.recargar(
        { ...contexto, estado: 'INICIAL' },
        resultado
    )) as ContextoMaestroRemesaPago;

    return Remesas.activar(recargado, remesaId);
};

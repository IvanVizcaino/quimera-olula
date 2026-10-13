import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import {
    accionesListaActivaEntidades,
    ProcesarListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { TarjetaPuntos } from "../diseño.ts";
import { getTarjetasPuntos } from "../infraestructura.ts";
import { ContextoMaestroTarjetaPuntos, EstadoMaestroTarjetaPuntos } from "./diseño.ts";

type ProcesarMaestroTarjetas = ProcesarContexto<
    EstadoMaestroTarjetaPuntos,
    ContextoMaestroTarjetaPuntos
>;

const conTarjetas =
    (fn: ProcesarListaActivaEntidades<TarjetaPuntos>) =>
        (ctx: ContextoMaestroTarjetaPuntos) => ({ ...ctx, tarjetas: fn(ctx.tarjetas) });

export const Tarjetas = accionesListaActivaEntidades(conTarjetas);

export const recargarTarjetas: ProcesarMaestroTarjetas = async (
    contexto,
    payload
) => {
    const criteria = payload as Criteria;
    const resultado = await getTarjetasPuntos(criteria);
    return Tarjetas.recargar(contexto, resultado);
};

import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades, recargarListaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Ejercicio } from "../diseño.ts";
import { getEjercicio, getEjercicios } from "../infraestructura.ts";
import { ContextoMaestroEjercicio, EstadoMaestroEjercicio } from "./diseño.ts";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroEjercicio, ContextoMaestroEjercicio>;

const conEjercicios = (fn: ProcesarListaActivaEntidades<Ejercicio>) =>
    (ctx: ContextoMaestroEjercicio) => ({ ...ctx, ejercicios: fn(ctx.ejercicios) });

export const Ejercicios = accionesListaActivaEntidades(conEjercicios);

export const recargarEjercicios: ProcesarMaestro = async (contexto, payload) => {
    const resultado = await getEjercicios(payload as Criteria);
    return Ejercicios.recargar(contexto, resultado);
};

export const ampliarEjercicios: ProcesarMaestro = async (contexto, payload) => {
    const resultado = await getEjercicios(payload as Criteria);
    return Ejercicios.ampliar(contexto, resultado);
};

/** Tras un cierre puede haber cambiado otro ejercicio (el de la apertura, o
 * uno nuevo): se recarga la lista entera manteniendo la selección. */
export const recargarTrasCambio: ProcesarMaestro = async (contexto) => {
    const resultado = await getEjercicios(contexto.ejercicios.criteria);
    const lista = recargarListaEntidades(contexto.ejercicios, resultado);
    return {
        ...contexto,
        ejercicios: { ...lista, activo: contexto.ejercicios.activo },
    };
};

export const incluirEjercicioCreadoPorId: ProcesarMaestro = async (contexto, payload) => {
    const ejercicio = await getEjercicio(payload as string);
    return {
        ...contexto,
        estado: "INICIAL",
        ejercicios: {
            ...contexto.ejercicios,
            lista: [ejercicio, ...contexto.ejercicios.lista],
            total: contexto.ejercicios.total + 1,
            activo: ejercicio.id,
        },
    };
};

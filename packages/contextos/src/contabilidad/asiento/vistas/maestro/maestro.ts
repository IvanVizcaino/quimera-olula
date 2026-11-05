import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { ItemAsiento } from "../../diseño.ts";
import { getAsiento, getAsientos } from "../../infraestructura.ts";
import { ContextoMaestroAsiento, EstadoMaestroAsiento } from "./maquina.ts";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroAsiento, ContextoMaestroAsiento>;

const conAsientos = (fn: ProcesarListaActivaEntidades<ItemAsiento>) =>
    (ctx: ContextoMaestroAsiento) => ({ ...ctx, asientos: fn(ctx.asientos) });

export const Asientos = accionesListaActivaEntidades(conAsientos);

export const recargarAsientos: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getAsientos(criteria);
    return Asientos.recargar(contexto, resultado);
};

export const ampliarAsientos: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getAsientos(criteria);
    return Asientos.ampliar(contexto, resultado);
};

export const incluirAsientoCreadoPorId: ProcesarMaestro = async (contexto, payload) => {
    const id = payload as string;
    const asiento = await getAsiento(id);
    return {
        ...contexto,
        estado: "INICIAL",
        asientos: {
            ...contexto.asientos,
            lista: [asiento, ...contexto.asientos.lista],
            total: contexto.asientos.total + 1,
            activo: asiento.id,
        },
    };
};

export const recargarTrasRenumeracion: ProcesarMaestro = async (contexto) => {
    const resultado = await getAsientos(contexto.asientos.criteria);
    // Asientos.recargar es async: sin el await se extendería la promesa, que no
    // tiene propiedades propias, y el contexto se quedaría sin `asientos`.
    const recargado = (await Asientos.recargar(contexto, resultado)) as ContextoMaestroAsiento;
    return { ...recargado, estado: "INICIAL" };
};

export const quitarAsientoBorrado: ProcesarMaestro = async (contexto, payload) => {
    const id = payload as string;
    const lista = contexto.asientos.lista.filter((a) => a.id !== id);
    return {
        ...contexto,
        asientos: {
            ...contexto.asientos,
            lista,
            total: Math.max(0, contexto.asientos.total - 1),
            activo: contexto.asientos.activo === id ? (lista[0]?.id ?? undefined) : contexto.asientos.activo,
        },
    };
};

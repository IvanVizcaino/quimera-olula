import { Contexto, Criteria, Entidad, ProcesarContexto } from "@olula/lib/diseño.js";
import { pipe } from "@olula/lib/funcional.js";
import { criteriaDefecto } from "./dominio.ts";

export type ListaActivaEntidades<T extends Entidad> = {
    lista: T[];
    total: number;
    activo: string | undefined;
    criteria: Criteria;
};

export const listaActivaEntidadesInicial = <T extends Entidad>(id?: string, criteria: Criteria = criteriaDefecto): ListaActivaEntidades<T> => ({
    lista: [] as T[],
    total: 0,
    activo: id,
    criteria
})

export type ProcesarListaActivaEntidades<T extends Entidad> = (prev: ListaActivaEntidades<T>, payload?: unknown) => ListaActivaEntidades<T>;

const conLista = <T extends Entidad>(lista: T[]): ProcesarListaActivaEntidades<T> => (prev) => ({ ...prev, lista });
const conTotal = <T extends Entidad>(total: number): ProcesarListaActivaEntidades<T> => (prev) => ({ ...prev, total });
const conActivo = <T extends Entidad>(activo: string | undefined): ProcesarListaActivaEntidades<T> => (prev) => ({ ...prev, activo });
const conCriteria = <T extends Entidad>(criteria: Criteria): ProcesarListaActivaEntidades<T> => (prev) => ({ ...prev, criteria });

export const recargarListaEntidades = <T extends Entidad>(prev: ListaActivaEntidades<T>, payload?: unknown): ListaActivaEntidades<T> => {
    const { datos, total } = payload as { datos: T[]; total: number } ?? { datos: [], total: 0 };

    return pipe(
        prev,
        conLista(datos),
        conTotal(total === -1 ? prev.total : total),
        conActivo(prev.activo)
    )
}

export const ampliarListaEntidades = <T extends Entidad>(prev: ListaActivaEntidades<T>, payload?: unknown): ListaActivaEntidades<T> => {
    const { datos, total } = payload as { datos: T[]; total: number } ?? { datos: [], total: 0 };

    return pipe(
        prev,
        conLista([...prev.lista, ...datos]),
        conTotal(total === -1 ? prev.total : total),
        conActivo(prev.activo)
    )
}

export const incluirEnListaEntidades = <T extends Entidad>(prev: ListaActivaEntidades<T>, payload?: unknown): ListaActivaEntidades<T> => {
    const nuevo = payload as T;

    return pipe(
        prev,
        conLista([nuevo, ...prev.lista]),
        conTotal(prev.total + 1),
    )
}

export const quitarDeListaEntidades = <T extends Entidad>(prev: ListaActivaEntidades<T>, payload?: unknown): ListaActivaEntidades<T> => {
    const idBorrada = (payload as string) ?? prev.activo;

    if (!idBorrada) return prev;

    const indiceEntidadActiva = prev.lista.findIndex(l => l.id === idBorrada);

    return pipe(
        prev,
        conLista(prev.lista.filter(elemento => elemento.id !== idBorrada)),
        conTotal(prev.total - 1),
        activarEntidadPorIndice(indiceEntidadActiva),
    )
}

export const filtrarEntidades = <T extends Entidad>(prev: ListaActivaEntidades<T>, payload?: unknown): ListaActivaEntidades<T> => {
    const criteria = payload as Criteria;

    return pipe(
        prev,
        conCriteria(criteria)
    )
}

const activarEntidadPorIndice = <T extends Entidad>(indice: number): ProcesarListaActivaEntidades<T> => (prev) => {
    const lista = prev.lista;
    const entidadActiva = lista.length > 0
        ? indice >= 0 && indice < lista.length
            ? lista[indice]
            : lista[lista.length - 1]
        : null;

    return pipe(prev, conActivo(entidadActiva?.id))
}

export const cambiarEnListaEntidades = <T extends Entidad>(prev: ListaActivaEntidades<T>, payload?: unknown): ListaActivaEntidades<T> => {
    const cambiado = payload as T;

    return pipe(
        prev,
        conLista(prev.lista.map(item => item.id === cambiado.id ? cambiado : item))
    )
}

export const activarElementoListaEntidades = <T extends Entidad>(prev: ListaActivaEntidades<T>, payload?: unknown): ListaActivaEntidades<T> => {
    const id = typeof payload === "string" ? payload : (payload as T).id;

    return pipe(
        prev,
        conActivo(id),
    )
}

export const desactivarElementoListaEntidades = <T extends Entidad>(prev: ListaActivaEntidades<T>): ListaActivaEntidades<T> => {
    return pipe(
        prev,
        conActivo(undefined),
    )
}

export const procesarListaEntidades = <T extends Entidad, E extends string, C extends Contexto<E>>(actualizar: (listaEntidades: ProcesarListaActivaEntidades<T>) => (ctx: C) => C) =>
    (fn: ProcesarListaActivaEntidades<T>): ProcesarContexto<E, C> =>
        async (contexto, payload) => {
            return pipe(
                contexto,
                actualizar((prev: ListaActivaEntidades<T>) => fn(prev, payload))
            )
        }

export const accionesListaActivaEntidades = <T extends Entidad, E extends string, C extends Contexto<E>>(actualizar: (listaEntidades: ProcesarListaActivaEntidades<T>) => (ctx: C) => C) => {
    const procesar = procesarListaEntidades(actualizar);

    return {
        incluir: procesar(incluirEnListaEntidades),
        quitar: procesar(quitarDeListaEntidades),
        cambiar: procesar(cambiarEnListaEntidades),
        activar: procesar(activarElementoListaEntidades),
        desactivar: procesar(desactivarElementoListaEntidades),
        recargar: procesar(recargarListaEntidades),
        ampliar: procesar(ampliarListaEntidades),
        filtrar: procesar(filtrarEntidades),
    }
}
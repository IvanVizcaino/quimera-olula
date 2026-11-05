import { Contexto, Entidad, ProcesarContexto } from "@olula/lib/diseño.js";
import { pipe } from "@olula/lib/funcional.js";

export type ListaEntidades<T extends Entidad> = {
    lista: T[];
    total: number;
    activo: T | null;
};

export const listaEntidadesInicial = <T extends Entidad>(): ListaEntidades<T> => ({
    lista: [] as T[],
    total: 0,
    activo: null
})

export type ProcesarListaEntidades<T extends Entidad> = (prev: ListaEntidades<T>, payload?: unknown) => ListaEntidades<T>;

const conLista = <T extends Entidad>(lista: T[]): ProcesarListaEntidades<T> => (prev) => ({ ...prev, lista });
const conTotal = <T extends Entidad>(total: number): ProcesarListaEntidades<T> => (prev) => ({ ...prev, total });
const conActivo = <T extends Entidad>(activo: T | null): ProcesarListaEntidades<T> => (prev) => ({ ...prev, activo });

export const recargarListaEntidades = <T extends Entidad>(prev: ListaEntidades<T>, payload?: unknown): ListaEntidades<T> => {
    const { datos, total } = payload as { datos: T[]; total: number } ?? { datos: [], total: 0 };

    return pipe(
        prev,
        conLista(datos),
        conTotal(total === -1 ? prev.total : total),
        conActivo(prev.activo
            ? datos.find(elemento => elemento.id === prev.activo?.id) ?? null : null)
    )
}

export const incluirEnListaEntidades = <T extends Entidad>(prev: ListaEntidades<T>, payload?: unknown): ListaEntidades<T> => {
    const nuevo = payload as T;

    return pipe(
        prev,
        conLista([nuevo, ...prev.lista]),
        conTotal(prev.total + 1),
    )
}

export const quitarDeListaEntidades = <T extends Entidad>(prev: ListaEntidades<T>, payload?: unknown): ListaEntidades<T> => {
    const idBorrada = payload as string;

    const indiceEntidadActiva = prev.lista.findIndex(l => l.id === idBorrada);

    return pipe(
        prev,
        conLista(prev.lista.filter(elemento => elemento.id !== idBorrada)),
        conTotal(prev.total - 1),
        activarEntidadPorIndice(indiceEntidadActiva),
    )
}

const activarEntidadPorIndice = <T extends Entidad>(indice: number): ProcesarListaEntidades<T> => (prev) => {

    const lista = prev.lista;
    const entidadActiva = lista.length > 0
        ? indice >= 0 && indice < lista.length
            ? lista[indice]
            : lista[lista.length - 1]
        : null

    return {
        ...prev,
        activo: entidadActiva
    }
}

export const cambiarEnListaEntidades = <T extends Entidad>(prev: ListaEntidades<T>, payload?: unknown): ListaEntidades<T> => {
    const cambiado = payload as T;

    return pipe(
        prev,
        conLista(prev.lista.map(item => item.id === cambiado.id ? cambiado : item))
    )
}

export const activarElementoListaEntidades = <T extends Entidad>(prev: ListaEntidades<T>, payload?: unknown): ListaEntidades<T> => {
    const elemento = payload as T;

    return pipe(
        prev,
        conActivo(elemento),
    )
}

export const desactivarElementoListaEntidades = <T extends Entidad>(prev: ListaEntidades<T>): ListaEntidades<T> => {
    return pipe(
        prev,
        conActivo(null as unknown as T),
    )
}

export const procesarListaEntidades = <T extends Entidad, E extends string, C extends Contexto<E>>(actualizar: (listaEntidades: ProcesarListaEntidades<T>) => (ctx: C) => C) =>
    (fn: ProcesarListaEntidades<T>): ProcesarContexto<E, C> =>
        async (contexto, payload) => {
            return pipe(
                contexto,
                actualizar((prev: ListaEntidades<T>) => fn(prev, payload))
            )
        }

export const accionesListaEntidades = <T extends Entidad, E extends string, C extends Contexto<E>>(actualizar: (listaEntidades: ProcesarListaEntidades<T>) => (ctx: C) => C) => {
    const procesar = procesarListaEntidades(actualizar);

    return {
        incluir: procesar(incluirEnListaEntidades),
        quitar: procesar(quitarDeListaEntidades),
        cambiar: procesar(cambiarEnListaEntidades),
        activar: procesar(activarElementoListaEntidades),
        desactivar: procesar(desactivarElementoListaEntidades),
        recargar: procesar(recargarListaEntidades),
    }
}
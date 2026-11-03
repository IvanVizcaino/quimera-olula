import { useCallback, useState } from "react";
import { Entidad } from "./diseño.js";

type HookLista<E extends Entidad> = {
    lista: E[],
    setLista: (lista: E[]) => void,
    refrescar: (lista: E[], id?: string) => void,
    añadir: (entidad: E) => void,
    eliminar: (entidad: E) => void,
    modificar: (entidad: E) => void,
    seleccionar: (entidad: E) => void,
    seleccionarPorId: (id: string) => void,
    limpiarSeleccion: () => void,
    seleccionada: E | null,
    idSeleccionada: string | null
}

export function useLista<E extends Entidad>(
    listaInicial: E[],
): HookLista<E> {

    const entidadSeleccionada = listaInicial.length > 0 ? listaInicial[0] : null;
    const idEntidadSeleccionada = entidadSeleccionada ? entidadSeleccionada.id : null;

    const [entidades, setEntidades] = useState<E[]>(listaInicial);
    const [idSeleccionada, setIdSeleccionada] = useState<string | null>(idEntidadSeleccionada);

    const añadir = useCallback((entidad: E) => {
        setEntidades([entidad, ...entidades]);
        setIdSeleccionada(entidad.id);
    }, [entidades, setEntidades, setIdSeleccionada]);

    const getPorId = useCallback((id: string | null) => {
        const elementos = entidades.filter((e) => e.id === id);
        if (elementos.length === 1) {
            return elementos[0];
        }
        return null;
    }, [entidades]);

    const seleccionar = useCallback((entidad: E) => {
        const entidadEncontrada = getPorId(entidad.id);
        if (entidadEncontrada) {
            setIdSeleccionada(entidadEncontrada.id);
        } else {
            setIdSeleccionada(null);
        }
    }, [setIdSeleccionada, getPorId]);

    const seleccionarPorId = useCallback((id: string) => {
        const entidad = entidades.find((e) => e.id === id);
        setIdSeleccionada(entidad ? entidad.id : null);
    }, [entidades, setIdSeleccionada]);

    const limpiarSeleccion = useCallback(() => {
        setIdSeleccionada(null);
    }, [setIdSeleccionada]);

    const modificar = useCallback((entidad: E) => {
        const listaModificada = entidades.map((e) => (e.id === entidad.id ? entidad : e));
        setEntidades(listaModificada);
        setIdSeleccionada(entidad.id);
    }, [entidades, setEntidades, setIdSeleccionada]);


    const eliminar = useCallback((entidad: E) => {
        const indiceEntidad = (entidad: E) => {
            return entidades.findIndex((e) => e.id === entidad.id);
        }
        const entidadSeleccionadaTrasEliminacion = (entidadAEliminar: E) => {
            const indice = indiceEntidad(entidadAEliminar);
            if (indice == -1) {
                return null;
            }
            const longitud = entidades.length;
            return longitud > indice + 1 ? entidades[indice + 1] : (indice > 0 ? entidades[indice - 1] : null);
        }
        const listaModificada = entidades.filter((e) => e.id !== entidad.id);
        const nuevaSeleccionada = entidadSeleccionadaTrasEliminacion(entidad);
        setEntidades(listaModificada);
        setIdSeleccionada(nuevaSeleccionada ? nuevaSeleccionada.id : null);
    }, [entidades, setEntidades, setIdSeleccionada]);

    const refrescar = useCallback((lista: E[], id?: string) => {
        const idASeleccionar = id || idSeleccionada;
        const indiceEnListaActual = entidades.findIndex((e) => e.id === idASeleccionar);
        const indiceEnNuevaLista = idASeleccionar
            ? lista.findIndex((e) => e.id === idASeleccionar)
            : -1;
        const indiceSeleccionada = indiceEnNuevaLista > -1
            ? indiceEnNuevaLista
            : lista.length > 0
                ? indiceEnListaActual < lista.length
                    ? indiceEnListaActual < 0
                        ? 0
                        : indiceEnListaActual
                    : lista.length - 1
                : null
        setEntidades(lista);
        setIdSeleccionada(indiceSeleccionada !== null ? lista[indiceSeleccionada].id : null);
    }, [entidades, setEntidades, idSeleccionada, setIdSeleccionada]);

    const setLista = useCallback((lista: E[]) => {
        setEntidades(lista);
        const esMovil = window.matchMedia("(max-width: 768px)").matches;
        if (!esMovil && lista.length > 0) {
            setIdSeleccionada(lista[0].id);
        }
    }, [setEntidades, setIdSeleccionada]);

    const seleccionada = useCallback(() => {
        const entidad = getPorId(idSeleccionada);
        return entidad;
    }, [idSeleccionada, getPorId]);

    return {
        lista: entidades,
        setLista,
        refrescar,
        añadir,
        modificar,
        eliminar,
        seleccionar,
        seleccionarPorId,
        limpiarSeleccion,
        get seleccionada() {
            return seleccionada();
        },
        idSeleccionada
    }
}
/**
 * Puente para compartir el nombre de página entre el legacy app y el nuevo framework.
 * El legacy app escribe con setNombrePagina(); el nuevo framework lee con useNombrePagina().
 */
import { useSyncExternalStore } from "react";

let _nombrePagina = "";
const _listeners = new Set<() => void>();

export const setNombrePagina = (name: string) => {
    _nombrePagina = name;
    _listeners.forEach(l => l());
};

export const useNombrePagina = (): string =>
    useSyncExternalStore(
        cb => { _listeners.add(cb); return () => _listeners.delete(cb); },
        () => _nombrePagina,
    );

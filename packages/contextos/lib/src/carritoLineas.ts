/**
 * Puente para compartir las líneas del carrito entre el legacy app y el nuevo framework.
 * El legacy app escribe con setLineasCarrito(); el nuevo framework lee con useLineasCarrito().
 */
import { useSyncExternalStore } from "react";

export type LineaCarrito = Record<string, unknown>;

let _lineas: LineaCarrito[] = [];
const _listeners = new Set<() => void>();

export const setLineasCarrito = (lineas: LineaCarrito[]) => {
    _lineas = lineas;
    _listeners.forEach(l => l());
};

export const useLineasCarrito = (): LineaCarrito[] =>
    useSyncExternalStore(
        cb => { _listeners.add(cb); return () => _listeners.delete(cb); },
        () => _lineas,
    );

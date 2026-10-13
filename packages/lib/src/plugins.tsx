import { ComponentType, createElement } from "react";
import { Navigate } from "react-router";
import { plugin } from "./dominio.ts";

/**
 * Plugins del backend vistos desde el frontend.
 *
 * El backend manda en whoami `plugins: {nombre: estado}` (ver `plugin()` en
 * dominio.ts). El estado es el nombre de la variante elegida en el INI de la
 * app, y no siempre es "activo"/"inactivo": hay "activa"/"inactiva",
 * variantes con nombre propio ("firma", "basico", "plaid"...), "legacy",
 * "NoConfigurado" (la clave está registrada pero no resuelve a ningún plugin)
 * y plugins que ni siquiera llegan (no registrados en el backend o backend
 * antiguo). Aquí se normaliza todo a un booleano.
 */

/** Estados (en minúsculas) que significan "plugin apagado". */
const ESTADOS_INACTIVOS = new Set([
    "",
    "inactivo",
    "inactiva",
    "ninguna", // tienda_online
    "noconfigurado",
    "legacy", // variante neutra de iva_nav: comportamiento previo al plugin
]);

/** Normaliza cualquier valor que pueda llegar del backend a un estado en minúsculas sin espacios. */
export const normalizarEstadoPlugin = (estado: unknown): string =>
    typeof estado === "string" ? estado.trim().toLowerCase() : "";

/** True si el estado, tal como llega del backend, es el de un plugin encendido (cualquier variante no neutra). */
export const estadoPluginActivo = (estado: unknown): boolean =>
    !ESTADOS_INACTIVOS.has(normalizarEstadoPlugin(estado));

/**
 * ¿Está activo el plugin `nombre`?
 *
 * - Sin `variantes`: activo es cualquier variante que no sea neutra (ver
 *   ESTADOS_INACTIVOS). Plugin ausente, null o undefined => false.
 * - Con `variantes`: solo esas variantes cuentan (p. ej. `"firma"`), útil
 *   cuando el comportamiento depende de la variante y no solo de que haya plugin.
 */
export const pluginActivo = (
    nombre: string,
    variantes?: string | string[]
): boolean => {
    const estado = normalizarEstadoPlugin(plugin(nombre));
    if (!estadoPluginActivo(estado)) return false;
    if (variantes === undefined) return true;

    const validas = (Array.isArray(variantes) ? variantes : [variantes]).map(
        normalizarEstadoPlugin
    );
    return validas.includes(estado);
};

/**
 * Requisito de plugin que se declara en menús, rutas, widgets y slots:
 * - `"trazabilidad"`: el plugin debe estar activo.
 * - `{ nombre: "estado_expedicion_factura", variante: ["firma"] }`: debe estar en esa variante.
 * - `["a", "b"]`: deben cumplirse todos.
 */
export type RequisitoPlugin =
    | string
    | { nombre: string; variante?: string | string[] }
    | RequisitoPlugin[];

/** Sin requisito (undefined) siempre se cumple: comportamiento idéntico al anterior a los plugins. */
export const cumplePlugin = (requisito?: RequisitoPlugin): boolean => {
    if (requisito === undefined) return true;
    if (Array.isArray(requisito)) return requisito.every(cumplePlugin);
    if (typeof requisito === "string") return pluginActivo(requisito);
    return pluginActivo(requisito.nombre, requisito.variante);
};

/**
 * Envuelve una ruta para que sea inaccesible si el plugin está inactivo
 * (redirige a "/"). La comprobación se hace al renderizar, no al construir el
 * router, porque whoami aún no existe cuando se carga el módulo.
 */
export const rutaConPlugin = (
    requisito: RequisitoPlugin,
    Componente: ComponentType
): ComponentType => {
    const RutaConPlugin = () =>
        cumplePlugin(requisito)
            ? createElement(Componente)
            : createElement(Navigate, { to: "/", replace: true });
    return RutaConPlugin;
};

/**
 * Slot de factoría condicionado a plugin: devuelve un componente que pinta
 * `Activo` si se cumple el requisito y `Inactivo` (o nada) si no.
 *
 * Uso en una factoría: `static TabLotes = slotConPlugin("trazabilidad", TabLotes)`.
 */
export const slotConPlugin = <P extends object>(
    requisito: RequisitoPlugin,
    Activo: ComponentType<P>,
    Inactivo?: ComponentType<P>
): ComponentType<P> => {
    const SlotConPlugin = (props: P) => {
        if (cumplePlugin(requisito)) return createElement(Activo, props);
        return Inactivo ? createElement(Inactivo, props) : null;
    };
    return SlotConPlugin;
};

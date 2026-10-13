import { RouteObject } from "react-router";
import { RequisitoPlugin, rutaConPlugin } from "./plugins.tsx";

/**
 * `plugins` (opcional) asocia rutas del `router` a un plugin requerido:
 * `{ "/trazabilidad": "trazabilidad" }`. Con el plugin inactivo la ruta
 * redirige a "/". Las rutas sin entrada se registran exactamente igual que antes.
 */
type ContextFactory = {
    router: RouteObject;
    plugins?: Record<string, RequisitoPlugin>;
};

export const crearRouter = (factory: Record<string, ContextFactory>) => {
    const factorias = Object.values(factory) as ContextFactory[];
    const rutas = factorias
        .filter((f) => f?.router)
        .flatMap((f) =>
            Object.entries(f.router).map(([k, v]) => {
                const requisito = f.plugins?.[k];
                return {
                    path: k,
                    Component: requisito !== undefined ? rutaConPlugin(requisito, v) : v,
                };
            })
        );
    return rutas as RouteObject[];
};

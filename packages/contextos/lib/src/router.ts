import { RouteObject } from "react-router";

type ContextFactory = { router: RouteObject };

export const crearRouter = (factory: Record<string, ContextFactory>) => {
    const factorias = Object.values(factory);
    const routers = factorias.map(v => (v as ContextFactory)?.router).filter(Boolean).flat();
    const rutas = routers.map(r => Object.entries(r).map(([k, v]) => ({ path: k, Component: v }))).flat();
    return rutas as RouteObject[];
};
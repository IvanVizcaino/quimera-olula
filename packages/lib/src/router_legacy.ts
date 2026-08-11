import { JSX } from "react";
import { RouteObject } from "react-router";

export type Dependency = {
    dependencies: Dependency[];
    routes?: Routes;
}
type Routes = Record<Ruta, unknown>;
type Ruta = string;

export const crearRouterLegacy = (project: Dependency, comp: JSX.Element): RouteObject[] => {
    const LegacyApp = () => comp;
    return getRutasLegacy(project).map(r => ({ path: r.slice(1), Component: LegacyApp }));
};

const getRutasLegacy = (project: Dependency): Ruta[] => filtrarUnicos(getDependenciasRecursivas(project)).flatMap(getRutas);

const getDependencias = (dep: Dependency): Dependency[] => dep.dependencies;
const getRutas = (dep: Dependency): Ruta[] => Object.keys(dep.routes ?? {});

const getDependenciasRecursivas = (dep: Dependency): Dependency[] => [
    dep,
    ...getDependencias(dep).flatMap(getDependenciasRecursivas),
];
const filtrarUnicos = (deps: Dependency[]): Dependency[] =>
    deps.filter((dep, index) => deps.indexOf(dep) === index);


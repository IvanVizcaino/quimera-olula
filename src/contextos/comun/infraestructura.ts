import { Filtro, Orden, ValorFiltro } from "./diseño.ts";

export const criteriaQuery = (filtro?: Filtro, orden?: Orden): string => {
    if (!filtro && !orden) {
        return "";
    }

    const criteria = transformarCriteria(filtro, orden);
    return `?q=${btoa(criteria)}`;
}

export const transformarCriteria = (filtro?: Filtro, orden?: Orden): string => {
    const filtroString = filtro ? transformarFiltro(filtro) : "";
    const ordenString = orden ? transformarOrden(orden) : "";

    return [filtroString, ordenString].filter(Boolean).join(" ");
}

const transformarFiltro = (filtro: Filtro): string => {
    return Object.entries(filtro).map(([campo, valor]) => `${campo}:${transformarValorFiltro(valor)}`).join(" ");
}

const transformarOrden = (orden: Orden): string => {
    return "orden:" + Object.entries(orden).map(([campo, valor]) => `${campo}-${valor}`).join(",");
}

const transformarValorFiltro = (valor: ValorFiltro): string => {
    if ("LIKE" in valor) {
        return `~${valor.LIKE}`;
    }
    return valor;
}

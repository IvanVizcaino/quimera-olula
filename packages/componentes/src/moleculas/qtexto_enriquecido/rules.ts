import type { JSX } from "react";
import type { DatosReferencia, ResolverReferencia } from "./types.ts";

// Cambia aqui de forma centralizada como se renderiza cada etiqueta.
export const marcaAElemento: Record<string, keyof JSX.IntrinsicElements> = {
    b: "strong",
    i: "em",
    u: "u",
    p: "p",
    br: "br",
};

export const marcasSinCierre = ["br"];

// Reservado para casos especiales que no sigan la regla generica x.y -> /x/y?...
export const resolversPorDefecto: Record<string, ResolverReferencia> = {};

const serializarCriterios = (criterios: Record<string, string>) => {
    const entradas = Object.entries(criterios).filter(
        ([clave, valor]) => !!clave && !!valor
    );
    if (entradas.length === 0) return "";

    const query = entradas
        .map(
            ([clave, valor]) =>
                `${encodeURIComponent(clave)}=${encodeURIComponent(valor)}`
        )
        .join("&");

    return `?${query}`;
};

export const resolverGenerico = ({ clave, criterios }: DatosReferencia) => {
    const ruta = `/${clave.replace(/\./g, "/")}`;
    return `${ruta}${serializarCriterios(criterios)}`;
};

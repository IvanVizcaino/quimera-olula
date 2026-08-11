import React from "react";
import { Link } from "react-router";
import { resolverGenerico } from "./rules.ts";
import type { Nodo, ResolverReferencia } from "./types.ts";

export const renderizarNodos = (
  nodos: Nodo[],
  opciones: {
    resolvers: Record<string, ResolverReferencia>;
    marcaAElemento: Record<string, keyof React.JSX.IntrinsicElements>;
    prefijo?: string;
  }
): React.ReactNode[] => {
  const { resolvers, marcaAElemento, prefijo = "n" } = opciones;

  return nodos.map((nodo, i) => {
    const key = `${prefijo}-${i}`;

    if (nodo.tipo === "texto") {
      return <React.Fragment key={key}>{nodo.contenido}</React.Fragment>;
    }

    if (nodo.tipo === "marca") {
      const elemento = marcaAElemento[nodo.marca] || "span";

      if (elemento === "br") {
        return React.createElement(elemento, { key });
      }

      return React.createElement(
        elemento,
        { key },
        renderizarNodos(nodo.hijos, {
          resolvers,
          marcaAElemento,
          prefijo: key,
        })
      );
    }

    const resolver = resolvers[nodo.clave];
    const referencia = {
      clave: nodo.clave,
      id: nodo.criterios.id || "",
      criterios: nodo.criterios,
      etiqueta: nodo.etiqueta,
    };
    const to = resolver?.(referencia) ?? resolverGenerico(referencia);

    if (!to) return <React.Fragment key={key}>{nodo.etiqueta}</React.Fragment>;

    return (
      <Link key={key} to={to}>
        {nodo.etiqueta}
      </Link>
    );
  });
};

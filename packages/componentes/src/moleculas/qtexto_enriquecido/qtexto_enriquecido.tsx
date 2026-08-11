import { parsearNodos } from "./parser.ts";
import { renderizarNodos } from "./renderer.tsx";
import {
  marcaAElemento,
  marcasSinCierre,
  resolversPorDefecto,
} from "./rules.ts";
import type { QTextoEnriquecidoProps } from "./types.ts";

export type {
  DatosReferencia,
  QTextoEnriquecidoProps,
  ResolverReferencia,
} from "./types.ts";

export const QTextoEnriquecido = ({
  texto,
  className,
  resolvers,
}: QTextoEnriquecidoProps) => {
  const marcasConCierre = Object.keys(marcaAElemento).filter(
    (marca) => !marcasSinCierre.includes(marca)
  );
  const nodos = parsearNodos(texto, marcasConCierre, marcasSinCierre);
  const resolversFinales = {
    ...resolversPorDefecto,
    ...resolvers,
  };

  return (
    <span className={className}>
      {renderizarNodos(nodos, {
        resolvers: resolversFinales,
        marcaAElemento,
      })}
    </span>
  );
};

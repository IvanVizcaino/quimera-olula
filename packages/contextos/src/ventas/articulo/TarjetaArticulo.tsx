import { QAvatar, QTarjetaGenerica } from "@olula/componentes/index.js";
import { formatearMoneda } from "@olula/lib/dominio.ts";
import { Articulo } from "./diseño.ts";

export const TarjetaArticulo = (articulo: Articulo) => {
  return (
    <QTarjetaGenerica
      avatar={<QAvatar nombre={articulo.descripcion} />}
      arribaIzquierda={articulo.descripcion}
      abajoDerecha={formatearMoneda(articulo.precio, "EUR")}
    />
  );
};

import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { QAvatar, QTarjetaGenerica } from "@olula/componentes/index.js";
import { formatearFechaDate, formatearMoneda } from "@olula/lib/dominio.ts";
import { Pedido } from "../diseño.ts";
import { etiquetaEstadoPedido } from "../dominio.ts";

export const TarjetaPedido = (pedido: Pedido) => (
  <QTarjetaGenerica
    avatar={<QAvatar nombre={pedido.nombreProveedor || pedido.codigo} />}
    arribaIzquierda={
      pedido.codigo +
      (pedido.nombreProveedor ? ` · ${pedido.nombreProveedor}` : "")
    }
    arribaDerecha={<EtiquetaEstado {...etiquetaEstadoPedido(pedido)} />}
    abajoIzquierda={pedido.fecha ? formatearFechaDate(pedido.fecha) : ""}
    abajoDerecha={formatearMoneda(pedido.total, pedido.divisaId)}
  />
);

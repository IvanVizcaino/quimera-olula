import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { useForm } from "@olula/lib/useForm.js";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useCallback } from "react";
import { LineaPedido } from "../diseño.ts";
import { deleteLinea } from "../infraestructura.ts";
import {
  TEXTO_CAMBIOS_EN_PREPARACION,
  useOrdenesAlmacenDePedido,
} from "../detalle/aviso_almacen/ordenes_almacen.ts";

export const BorrarLinea = ({
  pedidoId,
  publicar,
  linea,
}: {
  pedidoId: string;
  publicar: ProcesarEvento;
  linea: LineaPedido;
}) => {
  const borrar_ = useCallback(async () => {
    await deleteLinea(pedidoId, linea.id);
    publicar("linea_borrada", linea.id);
  }, [pedidoId, linea, publicar]);

  const cancelar_ = useCallback(
    () => publicar("borrar_linea_cancelado"),
    [publicar]
  );

  const [borrar, cancelar] = useForm(borrar_, cancelar_);
  const ordenesAlmacen = useOrdenesAlmacenDePedido(pedidoId);
  const mensaje = ordenesAlmacen.length > 0
    ? `El pedido está en preparación en almacén (${ordenesAlmacen.map((o) => o.id).join(", ")}). ` +
      `${TEXTO_CAMBIOS_EN_PREPARACION} ¿Borrar la línea?`
    : "¿Está seguro de que desea borrar esta línea?";

  return (
    <QModalConfirmacion
      nombre="confirmarBorrarLinea"
      abierto={true}
      titulo="Borrar línea"
      mensaje={mensaje}
      onCerrar={cancelar}
      onAceptar={borrar}
    />
  );
};

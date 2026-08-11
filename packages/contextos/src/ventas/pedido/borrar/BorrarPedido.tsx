import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Pedido } from "../diseño.ts";
import { borrarPedido } from "../infraestructura.ts";

export const BorrarPedido = ({
  publicar,
  pedido,
}: {
  publicar: (evento: string, payload?: unknown) => void;
  pedido: Pedido;
}) => {
  const borrar_ = useCallback(async () => {
    if (pedido.id) {
      await borrarPedido(pedido.id);
    }
    publicar("borrado_de_pedido_listo");
  }, [pedido.id, publicar]);

  const cancelar_ = useCallback(
    () => publicar("borrar_cancelado"),
    [publicar]
  );

  const [borrar, cancelar] = useForm(borrar_, cancelar_);

  return (
    <QModalConfirmacion
      nombre="confirmarBorrarPedido"
      abierto={true}
      titulo="Confirmar borrar"
      mensaje="¿Está seguro de que desea borrar este pedido?"
      onCerrar={cancelar}
      onAceptar={borrar}
    />
  );
};

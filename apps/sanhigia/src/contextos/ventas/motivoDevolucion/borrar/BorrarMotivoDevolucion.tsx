import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { MotivoDevolucion } from "../diseño.ts";
import { deleteMotivoDevolucion } from "../infraestructura.ts";

export const BorrarMotivoDevolucion = ({
  publicar,
  motivoDevolucion,
}: {
  publicar: EmitirEvento;
  motivoDevolucion: MotivoDevolucion;
}) => {
  const borrar_ = useCallback(async () => {
    await deleteMotivoDevolucion(motivoDevolucion.id);
    publicar("motivo_devolucion_borrado", motivoDevolucion.id);
  }, [motivoDevolucion.id, publicar]);

  const cancelar_ = useCallback(
    () => publicar("borrado_motivo_devolucion_cancelado"),
    [publicar]
  );

  const [borrar, cancelar] = useForm(borrar_, cancelar_);

  return (
    <QModalConfirmacion
      nombre="confirmarBorrarMotivoDevolucion"
      abierto={true}
      titulo="Confirmar borrado"
      mensaje="¿Está seguro de que desea borrar este motivo de devolución?"
      onCerrar={cancelar}
      onAceptar={borrar}
    />
  );
};

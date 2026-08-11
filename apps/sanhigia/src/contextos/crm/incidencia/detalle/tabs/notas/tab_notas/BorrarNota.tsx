import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { deleteNota } from "../../../../infraestructura.ts";
import { Nota } from "../diseño.ts";

export const BorrarNota = ({
  nota,
  emitir,
}: {
  nota: Nota;
  emitir: EmitirEvento;
}) => {
  const borrar_ = useCallback(async () => {
    await deleteNota(nota.id);
    emitir("nota_borrada");
  }, [nota.id, emitir]);

  const cancelar_ = useCallback(
    () => emitir("borrado_nota_cancelado"),
    [emitir]
  );

  const [borrar, cancelar] = useForm(borrar_, cancelar_);

  return (
    <QModalConfirmacion
      nombre="confirmarBorrarNota"
      abierto={true}
      titulo="Borrar nota"
      mensaje={`¿Está seguro de que desea borrar esta nota?`}
      onCerrar={cancelar}
      onAceptar={borrar}
    />
  );
};

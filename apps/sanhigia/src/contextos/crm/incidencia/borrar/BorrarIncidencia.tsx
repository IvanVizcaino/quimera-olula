import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Incidencia } from "../diseño.ts";
import { deleteIncidencia } from "../infraestructura.ts";

export const BorrarIncidencia = ({
  publicar,
  incidencia,
}: {
  incidencia: Incidencia;
  publicar: EmitirEvento;
}) => {
  const borrar_ = useCallback(async () => {
    await deleteIncidencia(incidencia.id);

    publicar("incidencia_borrada", incidencia.id);
  }, [publicar, incidencia.id]);

  const cancelar_ = useCallback(
    () => publicar("borrado_incidencia_cancelado"),
    [publicar]
  );

  const [borrar, cancelar] = useForm(borrar_, cancelar_);

  return (
    <QModalConfirmacion
      nombre="confirmarBorrarIncidencia"
      abierto={true}
      titulo="Confirmar borrado"
      mensaje={`¿Está seguro de que desea borrar esta incidencia?`}
      onCerrar={cancelar}
      onAceptar={borrar}
    />
  );
};

import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { LineaPresupuesto } from "../diseño.ts";
import { deleteLinea } from "../infraestructura.ts";

export const BorrarLinea = ({
  presupuestoId,
  publicar,
  linea,
}: {
  presupuestoId: string;
  publicar: EmitirEvento;
  linea: LineaPresupuesto;
}) => {
  const borrar_ = useCallback(async () => {
    await deleteLinea(presupuestoId, linea.id);
    publicar("linea_borrada", linea.id);
  }, [presupuestoId, linea, publicar]);

  const cancelar_ = useCallback(
    () => publicar("borrar_linea_cancelado"),
    [publicar]
  );

  const [borrar, cancelar] = useForm(borrar_, cancelar_);

  return (
    <QModalConfirmacion
      nombre="confirmarBorrarLinea"
      abierto={true}
      titulo="Borrar línea"
      mensaje="¿Está seguro de que desea borrar esta línea?"
      onCerrar={cancelar}
      onAceptar={borrar}
    />
  );
};

import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Presupuesto } from "../diseño.ts";
import { borrarPresupuesto } from "../infraestructura.ts";

export const BorrarPresupuesto = ({
  publicar,
  presupuesto,
}: {
  publicar: (evento: string, payload?: unknown) => void;
  presupuesto: Presupuesto;
}) => {
  const borrar_ = useCallback(async () => {
    if (presupuesto.id) {
      await borrarPresupuesto(presupuesto.id);
    }
    publicar("borrado_de_presupuesto_listo");
  }, [presupuesto.id, publicar]);

  const cancelar_ = useCallback(
    () => publicar("borrar_presupuesto_cancelado"),
    [publicar]
  );

  const [borrar, cancelar] = useForm(borrar_, cancelar_);

  return (
    <QModalConfirmacion
      nombre="confirmarBorrarPresupuesto"
      abierto={true}
      titulo="Confirmar borrar"
      mensaje="¿Está seguro de que desea borrar este presupuesto?"
      onCerrar={cancelar}
      onAceptar={borrar}
    />
  );
};

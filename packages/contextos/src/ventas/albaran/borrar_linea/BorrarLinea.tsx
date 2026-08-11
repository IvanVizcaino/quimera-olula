import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { useForm } from "@olula/lib/useForm.js";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useCallback } from "react";
import { LineaAlbaran } from "../diseño.ts";
import { deleteLinea } from "../infraestructura.ts";

export const BorrarLinea = ({
  publicar,
  linea,
  albaranId,
}: {
  publicar: ProcesarEvento;
  linea: LineaAlbaran;
  albaranId: string;
}) => {
  const borrar_ = useCallback(async () => {
    await deleteLinea(albaranId, linea.id);
    publicar("linea_borrada", linea.id);
  }, [albaranId, linea, publicar]);

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

import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Albaran } from "../diseño.ts";
import { borrarAlbaran } from "../infraestructura.ts";

export const BorrarAlbaran = ({
  publicar,
  albaran,
}: {
  publicar: (evento: string, payload?: unknown) => void;
  albaran: Albaran;
}) => {
  const borrar_ = useCallback(async () => {
    if (albaran.id) {
      await borrarAlbaran(albaran.id);
    }
    publicar("borrado_de_albaran_listo");
  }, [albaran.id, publicar]);

  const cancelar_ = useCallback(
    () => publicar("borrar_cancelado"),
    [publicar]
  );

  const [borrar, cancelar] = useForm(borrar_, cancelar_);

  return (
    <QModalConfirmacion
      nombre="confirmarBorrarAlbaran"
      abierto={true}
      titulo="Confirmar borrar"
      mensaje="¿Está seguro de que desea borrar este albarán?"
      onCerrar={cancelar}
      onAceptar={borrar}
    />
  );
};

import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useContext } from "react";
import { deleteArticulo } from "../infraestructura.ts";

interface BorrarArticuloProps {
  articuloId: string;
  publicar?: ProcesarEvento;
  onCancelar?: () => void;
}

export const BorrarArticulo = ({
  articuloId,
  publicar = async () => {},
  onCancelar = () => {},
}: BorrarArticuloProps) => {
  const { intentar } = useContext(ContextoError);

  const borrar = async () => {
    await intentar(() => deleteArticulo(articuloId));
    publicar("borrado_de_articulo_listo", { articuloId });
    onCancelar();
  };

  return (
    <QModalConfirmacion
      nombre="borrarArticulo"
      abierto={true}
      titulo="Confirmar borrado"
      mensaje="¿Está seguro de que desea borrar este artículo?"
      onCerrar={onCancelar}
      onAceptar={borrar}
    />
  );
};

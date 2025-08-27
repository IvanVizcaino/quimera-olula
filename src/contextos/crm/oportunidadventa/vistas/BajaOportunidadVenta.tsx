import { useContext } from "react";
import { QModalConfirmacion } from "../../../../componentes/moleculas/qmodalconfirmacion.tsx";
import { ContextoError } from "../../../comun/contexto.ts";
import { deleteOportunidadVenta } from "../infraestructura.ts";

export const BajaOportunidadVenta = ({
  emitir,
  activo = false,
  idOportunidadVenta,
}: {
  emitir: (evento: string, payload?: unknown) => void;
  idOportunidadVenta?: string;
  activo?: boolean;
}) => {
  const { intentar } = useContext(ContextoError);

  const borrar = async () => {
    if (idOportunidadVenta) {
      await intentar(() => deleteOportunidadVenta(idOportunidadVenta));
    }
    emitir("oportunidad_borrada");
  };

  return (
    <QModalConfirmacion
      nombre="confirmarBorrarOportunidadVenta"
      abierto={activo}
      titulo="Confirmar borrado"
      mensaje="¿Está seguro de que desea borrar esta oportunidad de venta?"
      onCerrar={() => emitir("oportunidad_borrada")}
      onAceptar={borrar}
    />
  );
};

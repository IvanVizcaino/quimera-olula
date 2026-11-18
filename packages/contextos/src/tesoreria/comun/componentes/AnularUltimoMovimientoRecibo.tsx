import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useCallback } from "react";

/**
 * TES-02/TES-06: confirma el borrado del último pago o devolución de un
 * recibo, que se lleva su asiento contable (Eneboo: borrar el último registro
 * de `pagosdevolcli`/`pagosdevolprov`).
 */
export const AnularUltimoMovimientoRecibo = ({
  codigo,
  tipo,
  fecha,
  publicar,
}: {
  codigo: string;
  tipo: string;
  fecha: Date | null;
  publicar: EmitirEvento;
}) => {
  const anular_ = useCallback(
    async () => publicar("anulacion_pago_confirmada"),
    [publicar]
  );

  const cancelar_ = useCallback(
    () => publicar("anulacion_pago_cancelada"),
    [publicar]
  );

  const [anular, cancelar] = useForm(anular_, cancelar_);

  const mensaje = [
    `Se borrará ${tipo.toLowerCase().startsWith("devol") ? "la devolución" : "el pago"}` +
      ` del ${fecha?.toLocaleDateString() ?? ""} del recibo ${codigo}, con su asiento contable.`,
    "",
    "El recibo vuelve al estado que tenía antes.",
  ].join("\n");

  return (
    <QModalConfirmacion
      nombre="anular_ultimo_movimiento_recibo"
      abierto={true}
      titulo="Anular último pago o devolución"
      mensaje={mensaje}
      onCerrar={cancelar}
      onAceptar={anular}
      labelAceptar="Anular"
    />
  );
};

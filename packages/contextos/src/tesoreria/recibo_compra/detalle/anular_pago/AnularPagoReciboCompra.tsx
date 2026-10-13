import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.ts";
import { useCallback } from "react";
import { ReciboCompra } from "../../diseño.js";
import { ultimoPagoCompra } from "../../dominio.js";

export const AnularPagoReciboCompra = ({
  recibo,
  publicar,
}: {
  recibo: ReciboCompra;
  publicar: EmitirEvento;
}) => {
  const ultimoPago = ultimoPagoCompra(recibo);

  const confirmar_ = useCallback(
    async () => publicar("anular_pago_confirmado", ultimoPago?.id ?? ""),
    [publicar, ultimoPago]
  );

  const cancelar_ = useCallback(
    () => publicar("anular_pago_cancelado"),
    [publicar]
  );

  const [confirmar, cancelar] = useForm(confirmar_, cancelar_);

  const fecha = ultimoPago?.fecha
    ? ultimoPago.fecha.toLocaleDateString("es-ES")
    : "desconocida";

  const mensaje = [
    `Se anulará el pago del recibo ${recibo.codigo} registrado el ${fecha}.`,
    "",
    "El recibo volverá a su estado anterior (Emitido).",
  ].join("\n");

  return (
    <QModalConfirmacion
      nombre="anular_pago_recibo_compra"
      abierto={true}
      titulo="Anular pago"
      mensaje={mensaje}
      onCerrar={cancelar}
      onAceptar={confirmar}
      labelAceptar="Anular pago"
    />
  );
};

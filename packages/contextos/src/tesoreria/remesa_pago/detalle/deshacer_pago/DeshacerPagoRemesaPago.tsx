import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useCallback } from "react";
import { RemesaPago } from "../../diseño.js";
import { esRemesaDeNominas } from "../../dominio.js";

export const DeshacerPagoRemesaPago = ({
  remesa,
  publicar,
}: {
  remesa: RemesaPago;
  publicar: EmitirEvento;
}) => {
  const deshacer_ = useCallback(
    async () => publicar("deshacer_pago_confirmado"),
    [publicar]
  );

  const cancelar_ = useCallback(
    () => publicar("deshacer_pago_cancelado"),
    [publicar]
  );

  const [deshacer, cancelar] = useForm(deshacer_, cancelar_);

  const que = esRemesaDeNominas(remesa) ? "Sus nóminas" : "Sus recibos";

  const mensaje = [
    `Se eliminará el pago de la remesa de pago ${remesa.id} y su asiento.`,
    "",
    `${que} vuelven a quedar remesados, pendientes de pago.`,
  ].join("\n");

  return (
    <QModalConfirmacion
      nombre="deshacer_pago_remesa_pago"
      abierto={true}
      titulo="Deshacer pago"
      mensaje={mensaje}
      onCerrar={cancelar}
      onAceptar={deshacer}
      labelAceptar="Deshacer"
    />
  );
};

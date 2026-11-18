import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QDate, QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { formatearMoneda } from "@olula/lib/dominio.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { RemesaPago } from "../../diseño.js";
import { esRemesaDeNominas } from "../../dominio.js";
import { metaPagoRemesaPago, pagoRemesaPagoInicial } from "./dominio.js";

export const PagarRemesaPago = ({
  remesa,
  publicar,
}: {
  remesa: RemesaPago;
  publicar: EmitirEvento;
}) => {
  const inicial = useMemo(
    () => pagoRemesaPagoInicial(remesa.fechaPago),
    [remesa.fechaPago]
  );

  const { modelo, uiProps, valido } = useModelo(metaPagoRemesaPago, inicial);

  const pagar_ = useCallback(
    async () => publicar("pago_confirmado", modelo.fecha),
    [modelo, publicar]
  );

  const cancelar_ = useCallback(() => publicar("pago_cancelado"), [publicar]);

  const [pagar, cancelar] = useForm(pagar_, cancelar_);

  const que = esRemesaDeNominas(remesa)
    ? `sus ${remesa.nominas.length} nóminas`
    : `sus ${remesa.recibos.length} recibos`;

  return (
    <QModal
      abierto={true}
      nombre="pagar_remesa_pago"
      titulo="Pagar remesa de pago"
      onCerrar={cancelar}
    >
      <div className="PagarRemesaPago">
        <p>{`Se pagará la remesa entera, ${que}, por ${formatearMoneda(
          remesa.total,
          remesa.divisaId || "EUR"
        )}.`}</p>
        <quimera-formulario>
          <QDate label="Fecha" {...uiProps("fecha")} />
        </quimera-formulario>
        <div className="botones maestro-botones">
          <QBoton onClick={pagar} deshabilitado={!valido}>
            Pagar
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};

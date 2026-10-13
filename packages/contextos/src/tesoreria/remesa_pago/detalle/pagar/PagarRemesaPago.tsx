import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QDate, QInput, QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { metaPagoRemesaPago, pagoRemesaPagoVacio } from "./dominio.js";

export const PagarRemesaPago = ({ publicar }: { publicar: EmitirEvento }) => {
  const inicial = useMemo(pagoRemesaPagoVacio, []);

  const { modelo, uiProps, valido } = useModelo(metaPagoRemesaPago, inicial);

  const pagar_ = useCallback(
    async () => publicar("pago_confirmado", modelo),
    [modelo, publicar]
  );

  const cancelar_ = useCallback(() => publicar("pago_cancelado"), [publicar]);

  const [pagar, cancelar] = useForm(pagar_, cancelar_);

  return (
    <QModal
      abierto={true}
      nombre="pagar_remesa_pago"
      titulo="Pagar remesa de pago"
      onCerrar={cancelar}
    >
      <div className="PagarRemesaPago">
        <quimera-formulario>
          <QDate label="Fecha" {...uiProps("fecha")} />
          <QInput label="IBAN" {...uiProps("iban")} />
          <QInput label="Nº cheque / otro medio" {...uiProps("numero_cheque")} />
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

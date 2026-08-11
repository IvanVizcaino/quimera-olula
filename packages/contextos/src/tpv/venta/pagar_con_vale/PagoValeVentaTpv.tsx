import { ValeTpv } from "#/tpv/vale/diseño.ts";
import { getVale } from "#/tpv/vale/infraestructura.ts";
import { VentaTpv } from "#/tpv/venta/diseño";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { formatearMoneda, redondeaMoneda } from "@olula/lib/dominio.js";
import { useFocus } from "@olula/lib/useFocus.js";
import { useForm } from "@olula/lib/useForm.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useMemo, useState } from "react";
import { postPago } from "../infraestructura.ts";
import "./PagoValeVentaTpv.css";
import { metaNuevoPagoVale, nuevoPagoValeInicial } from "./pagar_con_vale.ts";

export const PagoValeVentaTpv = ({
  publicar,
  venta,
}: {
  publicar: EmitirEvento;
  venta: VentaTpv;
}) => {
  const pendiente = redondeaMoneda(venta.total - venta.pagado, venta.divisa_id);

  const pagoInicial = useMemo(
      () => ({
        ...nuevoPagoValeInicial,
        pendiente,
      }),
      [pendiente]
    );

  const { modelo, uiProps, valido, set, init } = useModelo(metaNuevoPagoVale, pagoInicial);

  const { intentar } = useContext(ContextoError);

  const pagar_ = useCallback(async () => {
    const idPago = await postPago(venta.id, {
      importe: modelo.importe,
      formaPago: "VALE",
      idVale: modelo.vale_id,
    });
    publicar("pago_con_vale_hecho", idPago);
  }, [modelo, publicar, venta.id]);

  const cancelar_ = useCallback(() => publicar("pago_cancelado"), [publicar]);
  const [pagar, cancelar] = useForm(pagar_, cancelar_);

  const [vale, setVale] = useState<ValeTpv | null>(null);

  const buscarVale = async (barcode: string) => {
    if (!barcode) {
      return;
    }

    const vale = await intentar(() => getVale(barcode));
    setVale(vale);

    const saldoPendiente = vale.saldo_pendiente;
    console.log("saldoPendiente", saldoPendiente, "pendiente", pendiente);
    const importe = Math.min(saldoPendiente, pendiente);

    set({
      ...modelo,
      importe: importe,
      vale_id: vale.id,
      saldoVale: vale.saldo_pendiente,
    });
  };

  const focus = useFocus();

  const limpiar = () => {
    init({
      ...nuevoPagoValeInicial,
      pendiente,
    });
    setVale(null);
  };

  return (
    <QModal
      abierto={true}
      nombre="mostrar"
      titulo="Pago con vale"
      onCerrar={cancelar}
    >
      <div className="PagoValeVentaTpv">
        {vale && (
          <h3>
            {`Vale: ${vale.id}. Saldo inicial ${formatearMoneda(vale.saldo_inicial, venta.divisa_id)}. Saldo disponible ${formatearMoneda(vale.saldo_pendiente, venta.divisa_id)}`}
          </h3>
        )}

        <quimera-formulario>
          <div id="pendiente">
            {`A pagar: ${formatearMoneda(pendiente, venta.divisa_id)}`}
          </div>

          {vale && <QInput label="Importe" {...uiProps("importe")} />}

          {!vale && (
            <QInput
              label="Vale"
              nombre="vale_id"
              ref={focus}
              autoFocus
              onEnterKeyUp={(barcode) => buscarVale(barcode)}
            />
          )}
        </quimera-formulario>

        <div className="botones maestro-botones ">
          {vale && <QBoton onClick={limpiar}>Limpiar</QBoton>}
        </div>
        <div className="botones maestro-botones ">
          <QBoton onClick={pagar} deshabilitado={!valido}>
            Pagar
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};

import { CuentaBancariaSelect } from "#/tesoreria/comun/componentes/cuenta_bancaria_select.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QDate, QInput, QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useMemo } from "react";
import { ReciboVenta } from "../../diseño.js";
import { enDivisaExtranjera } from "../../dominio.js";
import { PagoRecibo } from "./diseño.js";
import { metaPagoRecibo, pagoReciboVacio } from "./dominio.js";

export const PagarReciboVenta = ({
  recibo,
  publicar,
}: {
  recibo: ReciboVenta;
  publicar: EmitirEvento;
}) => {
  const enDivisa = enDivisaExtranjera(recibo);
  // Memoizado: useModelo reinicia el modelo cada vez que cambia la meta.
  const meta = useMemo(() => metaPagoRecibo(enDivisa), [enDivisa]);

  const { modelo, uiProps, valido, init } = useModelo(meta, pagoReciboVacio);

  const pagar = async () => {
    const pago: PagoRecibo = { ...modelo };
    await publicar("pago_confirmado", pago);
    init(pagoReciboVacio);
  };

  const cancelar = () => {
    publicar("pago_cancelado");
    init(pagoReciboVacio);
  };

  return (
    <QModal
      abierto={true}
      nombre="pagar_recibo_venta"
      titulo="Pagar recibo"
      onCerrar={cancelar}
    >
      <div className="PagarReciboVenta">
        <quimera-formulario>
          <CuentaBancariaSelect
            label="Cuenta de pago"
            {...uiProps("cuenta_pago_id", "nombre_cuenta_pago")}
          />
          <QDate label="Fecha" {...uiProps("fecha")} />
          {enDivisa && (
            <QInput
              label={`Tasa de cambio ${recibo.divisaId} → ${recibo.divisaEmpresaId}`}
              {...uiProps("tasa_conversion")}
            />
          )}
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

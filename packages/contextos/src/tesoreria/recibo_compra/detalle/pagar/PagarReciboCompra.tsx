import { CuentaBancariaSelect } from "#/tesoreria/comun/componentes/cuenta_bancaria_select.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QDate, QInput, QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useMemo } from "react";
import { PagoRecibo } from "../../../recibo_venta/detalle/pagar/diseño.js";
import { metaPagoRecibo, pagoReciboVacio } from "../../../recibo_venta/detalle/pagar/dominio.js";
import { ReciboCompra } from "../../diseño.js";
import { enDivisaExtranjeraCompra } from "../../dominio.js";

/** TES-02: pago manual del recibo al proveedor desde una cuenta de la empresa. */
export const PagarReciboCompra = ({
  recibo,
  publicar,
}: {
  recibo: ReciboCompra;
  publicar: EmitirEvento;
}) => {
  const enDivisa = enDivisaExtranjeraCompra(recibo);
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
      nombre="pagar_recibo_compra"
      titulo="Pagar recibo"
      onCerrar={cancelar}
    >
      <div className="PagarReciboCompra">
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

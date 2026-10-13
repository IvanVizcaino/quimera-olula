import { CuentaBancariaSelect } from "#/empresa/comun/componentes/cuenta_bancaria_select.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QDate, QInput, QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { PagoReciboCompra } from "./diseño.js";
import { metaPagoReciboCompra, pagoReciboCompraVacio } from "./dominio.js";

export const PagarReciboCompra = ({ publicar }: { publicar: EmitirEvento }) => {
  const { modelo, uiProps, valido, init } = useModelo(
    metaPagoReciboCompra,
    pagoReciboCompraVacio
  );

  const pagar = async () => {
    const pago: PagoReciboCompra = { ...modelo };
    await publicar("pago_confirmado", pago);
    init(pagoReciboCompraVacio);
  };

  const cancelar = () => {
    publicar("pago_cancelado");
    init(pagoReciboCompraVacio);
  };

  return (
    <QModal
      abierto={true}
      nombre="pagar_recibo_compra"
      titulo="Registrar pago"
      onCerrar={cancelar}
    >
      <div className="PagarReciboCompra">
        <quimera-formulario>
          <CuentaBancariaSelect
            label="Cuenta de pago"
            {...uiProps("cuenta_pago_id", "nombre_cuenta_pago")}
          />
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

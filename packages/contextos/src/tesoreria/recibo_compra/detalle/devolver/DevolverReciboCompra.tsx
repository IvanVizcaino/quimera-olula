import { CuentaBancariaSelect } from "#/empresa/comun/componentes/cuenta_bancaria_select.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QDate, QInput, QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useMemo } from "react";
import { ReciboCompra } from "../../diseño.js";
import { DevolucionReciboCompra } from "./diseño.js";
import { devolucionReciboCompraVacia, metaDevolucionReciboCompra } from "./dominio.js";

export const DevolverReciboCompra = ({
  recibo,
  publicar,
}: {
  recibo: ReciboCompra;
  publicar: EmitirEvento;
}) => {
  const devolucionInicial = useMemo(
    () => devolucionReciboCompraVacia(recibo),
    [recibo]
  );

  const { modelo, uiProps, valido } = useModelo(
    metaDevolucionReciboCompra,
    devolucionInicial
  );

  const devolver = async () => {
    const devolucion: DevolucionReciboCompra = { ...modelo };
    await publicar("devolucion_confirmada", devolucion);
  };

  const cancelar = () => publicar("devolucion_cancelada");

  return (
    <QModal
      abierto={true}
      nombre="devolver_recibo_compra"
      titulo="Devolver recibo"
      onCerrar={cancelar}
    >
      <div className="DevolverReciboCompra">
        <quimera-formulario>
          <CuentaBancariaSelect
            label="Cuenta de pago"
            {...uiProps("cuenta_pago_id", "nombre_cuenta_pago")}
            deshabilitado
          />
          <QDate label="Fecha" {...uiProps("fecha")} />
          <QInput label="IBAN" {...uiProps("iban")} />
          <QInput label="Nº cheque / otro medio" {...uiProps("numero_cheque")} />
        </quimera-formulario>
        <div className="botones maestro-botones">
          <QBoton onClick={devolver} deshabilitado={!valido}>
            Devolver
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};

import { CuentaBancariaSelect } from "#/tesoreria/comun/componentes/cuenta_bancaria_select.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QDate, QInput, QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useMemo } from "react";
import { ReciboVenta } from "../../diseño.js";
import { enDivisaExtranjera } from "../../dominio.js";
import { DevolucionRecibo } from "./diseño.js";
import { devolucionReciboVacia, metaDevolucionRecibo } from "./dominio.js";

export const DevolverReciboVenta = ({
  recibo,
  publicar,
}: {
  recibo: ReciboVenta;
  publicar: EmitirEvento;
}) => {
  // Memoizado: useModelo reinicia el modelo cada vez que cambia el inicial.
  const devolucionInicial = useMemo(
    () => devolucionReciboVacia(recibo),
    [recibo]
  );

  const enDivisa = enDivisaExtranjera(recibo);
  const meta = useMemo(() => metaDevolucionRecibo(enDivisa), [enDivisa]);

  const { modelo, uiProps, valido } = useModelo(meta, devolucionInicial);

  const devolver = async () => {
    const devolucion: DevolucionRecibo = { ...modelo };
    await publicar("devolucion_confirmada", devolucion);
  };

  const cancelar = () => publicar("devolucion_cancelada");

  return (
    <QModal
      abierto={true}
      nombre="devolver_recibo_venta"
      titulo="Devolver recibo"
      onCerrar={cancelar}
    >
      <div className="DevolverReciboVenta">
        <quimera-formulario>
          <CuentaBancariaSelect
            label="Cuenta de pago"
            {...uiProps("cuenta_pago_id", "nombre_cuenta_pago")}
            deshabilitado
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
          <QBoton onClick={devolver} deshabilitado={!valido}>
            Devolver
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};

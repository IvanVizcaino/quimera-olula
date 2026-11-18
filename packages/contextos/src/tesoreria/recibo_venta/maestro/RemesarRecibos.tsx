import { CuentaBancariaSelect } from "#/tesoreria/comun/componentes/cuenta_bancaria_select.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { formatearMoneda } from "@olula/lib/dominio.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useCallback, useState } from "react";
import { ReciboVenta } from "../diseño.js";

export const RemesarRecibos = ({
  recibos,
  publicar,
}: {
  recibos: ReciboVenta[];
  publicar: EmitirEvento;
}) => {
  const [cuentaId, setCuentaId] = useState("");

  const remesar_ = useCallback(
    async () => publicar("remesado_confirmado", cuentaId),
    [cuentaId, publicar]
  );

  const cancelar_ = useCallback(
    () => publicar("remesado_cancelado"),
    [publicar]
  );

  const [remesar, cancelar] = useForm(remesar_, cancelar_);

  const total = recibos.reduce((suma, recibo) => suma + recibo.importe, 0);
  const cuantos = `${recibos.length} ${
    recibos.length === 1 ? "recibo" : "recibos"
  }`;

  return (
    <QModal
      abierto={true}
      nombre="remesar_recibos"
      titulo="Crear remesa de cobro"
      onCerrar={cancelar}
    >
      <div className="RemesarRecibos">
        <p>{`Se creará una remesa de cobro con ${cuantos} por ${formatearMoneda(
          total,
          "EUR"
        )}.`}</p>
        <quimera-formulario>
          <CuentaBancariaSelect
            nombre="cuenta_id"
            label="Cuenta de cargo"
            valor={cuentaId}
            onChange={(opcion) => setCuentaId(opcion?.valor ?? "")}
          />
        </quimera-formulario>
        <div className="botones maestro-botones">
          <QBoton onClick={remesar} deshabilitado={!cuentaId}>
            Remesar
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};

import { CuentaBancaria } from "#/empresa/comun/componentes/cuenta_bancaria.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useState } from "react";
import "./SeleccionarRemesa.css";

export const SeleccionarRemesa = ({
  cuentaRemesaId,
  descripcionCuentaRemesa,
  emitir,
}: {
  cuentaRemesaId: string;
  descripcionCuentaRemesa: string;
  emitir: (evento: string, payload?: unknown) => void;
}) => {
  const [seleccion, setSeleccion] = useState<{
    valor: string;
    descripcion: string;
  } | null>(
    cuentaRemesaId
      ? { valor: cuentaRemesaId, descripcion: descripcionCuentaRemesa }
      : null
  );

  const guardar = () =>
    seleccion &&
    emitir("remesa_elegida", {
      cuenta_id: seleccion.valor,
      descripcion: seleccion.descripcion,
    });

  return (
    <div className="SeleccionarRemesa">
      <quimera-formulario>
        <CuentaBancaria
          label="Buscar cuenta"
          valor={seleccion?.valor ?? ""}
          descripcion={seleccion?.descripcion ?? ""}
          onChange={setSeleccion}
        />
      </quimera-formulario>
      <div className="botones">
        <QBoton onClick={guardar} deshabilitado={!seleccion}>
          Guardar
        </QBoton>
        <QBoton
          tipo="reset"
          variante="texto"
          onClick={() => emitir("remesa_cancelada")}
        >
          Cancelar
        </QBoton>
      </div>
    </div>
  );
};

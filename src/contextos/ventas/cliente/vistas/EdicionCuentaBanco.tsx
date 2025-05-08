import { QBoton } from "../../../../componentes/atomos/qboton.tsx";
import { QInput } from "../../../../componentes/atomos/qinput.tsx";
import { useModelo } from "../../../comun/useModelo.ts";
import { CuentaBanco } from "../diseño.ts";
import { metaCuentaBanco } from "../dominio.ts";
import { patchCuentaBanco } from "../infraestructura.ts";
import "./TabCuentasBanco.css";

interface EdicionCuentaBancoProps {
  clienteId: string;
  cuenta: CuentaBanco;
  emitir: (evento: string, payload?: unknown) => void;
}

export const EdicionCuentaBanco = ({
  clienteId,
  cuenta,
  emitir,
}: EdicionCuentaBancoProps) => {
  const { modelo, uiProps, valido } = useModelo(metaCuentaBanco, cuenta);

  const guardar = async () => {
    await patchCuentaBanco(clienteId, modelo);
    emitir("CUENTA_ACTUALIZADA", modelo);
  };

  return (
    <>
      <quimera-formulario>
        <QInput label="IBAN" {...uiProps("iban")} />
        <QInput label="BIC" {...uiProps("bic")} />
      </quimera-formulario>
      <div className="botones">
        <QBoton onClick={guardar} deshabilitado={!valido}>
          Guardar
        </QBoton>
        <QBoton
          tipo="reset"
          variante="texto"
          onClick={() => emitir("EDICION_CANCELADA")}
        >
          Cancelar
        </QBoton>
      </div>
    </>
  );
};

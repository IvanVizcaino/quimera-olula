import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { useFocus } from "@olula/lib/useFocus.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { postCuentaBanco } from "../../infraestructura.ts";
import { metaNuevaCuentaBanco, nuevaCuentaBancoVacia } from "./dominio.ts";
import "./TabCuentasBanco.css";

interface CrearCuentaBancoProps {
  clienteId: string;
  emitir: (evento: string, payload?: unknown) => void;
}

export const CrearCuentaBanco = ({
  clienteId,
  emitir,
}: CrearCuentaBancoProps) => {
  const { modelo, uiProps, valido } = useModelo(
    metaNuevaCuentaBanco,
    nuevaCuentaBancoVacia
  );
  const focus = useFocus();

  const guardar = async () => {
    const cuentaCreada = await postCuentaBanco(clienteId, modelo);
    emitir("cuenta_creada", cuentaCreada);
  };

  return (
    <div className="alta-cuenta-banco">
      <h2>Nueva Cuenta Bancaria</h2>
      <quimera-formulario>
        <QInput label="Descripción" {...uiProps("descripcion")} ref={focus} />
        <QInput label="IBAN" {...uiProps("iban")} />
      </quimera-formulario>
      <div className="botones">
        <QBoton onClick={guardar} deshabilitado={!valido}>
          Guardar
        </QBoton>
        <QBoton
          tipo="reset"
          variante="texto"
          onClick={() => emitir("alta_cancelada")}
        >
          Cancelar
        </QBoton>
      </div>
    </div>
  );
};

import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { useFocus } from "@olula/lib/useFocus.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { CrmContacto } from "../../diseño.ts";
import { metaCrmContacto } from "./dominio.ts";
import "./CrmContactos.css";

interface EdicionCrmContactosProps {
  contacto: CrmContacto;
  emitir: (evento: string, payload?: unknown) => void;
}

export const EdicionCrmContactos = ({
  contacto,
  emitir,
}: EdicionCrmContactosProps) => {
  const { modelo, uiProps, valido } = useModelo(metaCrmContacto, contacto);
  const focus = useFocus();

  const guardar = async () => {
    emitir("actualizar_contacto", modelo);
  };

  return (
    <div className="edicion-crm-contactos">
      <quimera-formulario>
        <QInput label="Nombre" {...uiProps("nombre")} ref={focus} />
        <QInput label="Cargo" {...uiProps("cargo")} />
        <QInput label="Email" {...uiProps("email")} />
        <QInput label="Teléfono 1" {...uiProps("telefono1")} />
        <QInput label="Teléfono 2" {...uiProps("telefono2")} />
        <QTextArea label="Observaciones" {...uiProps("observaciones")} />
      </quimera-formulario>
      <div className="botones">
        <QBoton onClick={guardar} deshabilitado={!valido}>
          Guardar
        </QBoton>
        <QBoton
          tipo="reset"
          variante="texto"
          onClick={() => emitir("edicion_cancelada")}
        >
          Cancelar
        </QBoton>
      </div>
    </div>
  );
};

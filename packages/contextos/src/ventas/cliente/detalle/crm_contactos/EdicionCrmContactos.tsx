import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { useFocus } from "@olula/lib/useFocus.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { CrmContacto } from "../../diseño.ts";
import { metaCrmContacto } from "./dominio.ts";

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
        <QInput label="Email" {...uiProps("email")} />
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

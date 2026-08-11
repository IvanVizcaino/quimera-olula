import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { useFocus } from "@olula/lib/useFocus.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { metaNuevoCrmContacto, nuevoCrmContactoVacio } from "./dominio.ts";

interface CrearCrmContactosProps {
  emitir: (evento: string, payload?: unknown) => void;
}

export const CrearCrmContactos = ({ emitir }: CrearCrmContactosProps) => {
  const { modelo, uiProps, valido } = useModelo(
    metaNuevoCrmContacto,
    nuevoCrmContactoVacio
  );
  const focus = useFocus();

  const guardar = async () => {
    emitir("crear_contacto", modelo);
  };

  return (
    <div className="alta-crm-contactos">
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
          onClick={() => emitir("alta_cancelada")}
        >
          Cancelar
        </QBoton>
      </div>
    </div>
  );
};

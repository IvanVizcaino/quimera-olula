import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { grupoVacio, metaNuevoGrupo } from "../dominio.ts";
import "./AltaGrupo.css";

export const AltaGrupo = ({
  emitir = async () => {},
}: {
  emitir?: EmitirEvento;
}) => {
  const nuevoGrupo = useModelo(metaNuevoGrupo, grupoVacio);

  const guardar = async () => {
    await emitir("alta_de_grupo_confirmada", nuevoGrupo.modelo);
  };

  return (
    <div className="AltaGrupo">
      <h2>Nuevo Grupo</h2>
      <quimera-formulario>
        <QInput label="Identificador" {...nuevoGrupo.uiProps("id")} />
        <QInput label="Nombre" {...nuevoGrupo.uiProps("nombre")} />
      </quimera-formulario>
      <div className="botones">
        <QBoton onClick={guardar} deshabilitado={!nuevoGrupo.valido}>
          Guardar
        </QBoton>
        <QBoton onClick={() => emitir("ALTA_CANCELADA")} variante="texto">
          Cancelar
        </QBoton>
      </div>
    </div>
  );
};

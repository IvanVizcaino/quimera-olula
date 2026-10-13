import { Familia } from "#/almacen/comun/componentes/Familia.tsx";
import { TipoCodBarras } from "#/comun/componentes/tipoCodBarras.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { FormModelo } from "@olula/lib/dominio.ts";
import { pluginActivo } from "@olula/lib/plugins.tsx";
import "./TabGeneral.css";

export const TabGeneral = ({
  form,
  articuloId,
}: {
  form: FormModelo;
  articuloId: string;
}) => {
  const { uiProps } = form;
  const descripcionMultilinea = pluginActivo("lineas_largas");

  return (
    <div className="TabGeneral">
      <quimera-formulario>
        <QInput label="Referencia" nombre="id" valor={articuloId} soloLectura />
        {descripcionMultilinea ? (
          <QTextArea label="Descripción" rows={3} {...uiProps("descripcion")} />
        ) : (
          <QInput label="Descripción" {...uiProps("descripcion")} />
        )}
        <Familia {...uiProps("familiaId")} />
        <QInput label="Código de barras" {...uiProps("codbarras")} />
        <TipoCodBarras {...uiProps("tipoCodBarras")} />
        <QTextArea label="Observaciones" {...uiProps("observaciones")} />
      </quimera-formulario>
    </div>
  );
};

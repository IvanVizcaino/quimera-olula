import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { Factura } from "../diseño.ts";
import "./TabObservaciones.css";

interface TabClienteProps {
  factura: HookModelo<Factura>;
}

export const TabObservaciones = ({ factura }: TabClienteProps) => {
  const { uiProps, modelo } = factura;

  return (
    <div className="TabObservaciones">
      <quimera-formulario>
        <QTextArea
          label="Observaciones"
          rows={5}
          {...uiProps("observaciones")}
        />
        <QCheckbox label="Automática" {...uiProps("automatica")} deshabilitado opcional={false} />
        <QCheckbox label="Servicios" {...uiProps("servicios")} deshabilitado opcional={false} />
        <QCheckbox
          label="Rectificativa"
          nombre="rectificativa"
          valor={!!modelo.rectificativa_id}
          deshabilitado
        />
      </quimera-formulario>
    </div>
  );
};

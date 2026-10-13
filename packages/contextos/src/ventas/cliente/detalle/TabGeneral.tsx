import { TipoIdFiscal } from "#/comun/componentes/tipoIdFiscal.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { pluginActivo } from "@olula/lib/plugins.tsx";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { Cliente } from "../diseño.ts";
import "./TabGeneral.css";

interface TabGeneralProps {
  form: HookModelo<Cliente>;
  cliente: Cliente;
  emitirCliente: EmitirEvento;
  recargarCliente: () => void;
}

export const TabGeneral = ({
  form,
  cliente,
  emitirCliente,
}: TabGeneralProps) => {
  const { uiProps } = form;

  const conPersonaFisica = pluginActivo("persona_fisica");

  return (
    <div className="TabGeneral">
      <quimera-formulario>
        {conPersonaFisica && (
          <QCheckbox label="Persona física" {...uiProps("personaFisica")} />
        )}
        {(!conPersonaFisica || !cliente.personaFisica) && (
          <QInput label="Nombre" {...uiProps("nombre")} />
        )}
        {conPersonaFisica && cliente.personaFisica && (
          <>
            <QInput label="Nombre de pila" {...uiProps("nombrePila")} />
            <QInput label="Apellidos" {...uiProps("apellidos")} />
          </>
        )}
        <QInput label="Nombre Comercial" {...uiProps("nombre_comercial")} />
        <TipoIdFiscal {...uiProps("tipo_id_fiscal")} />
        <QInput label="Id Fiscal" {...uiProps("id_fiscal")} />
        <div className="TabGeneral-accion">
          <QBoton onClick={() => emitirCliente("cambio_id_fiscal_solicitado")}>
            Cambiar Id Fiscal
          </QBoton>
        </div>
        <QInput label="Teléfono 1" {...uiProps("telefono1")} />
        <QInput label="Teléfono 2" {...uiProps("telefono2")} />
        <QInput label="Email" {...uiProps("email")} />
        <QInput label="Web" {...uiProps("web")} />
        {cliente.de_baja && (
          <QDate label="Fecha Baja" {...uiProps("fecha_baja")} />
        )}
        <QTextArea label="Observaciones" {...uiProps("observaciones")} />
      </quimera-formulario>
    </div>
  );
};

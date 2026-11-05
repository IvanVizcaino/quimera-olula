import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { FormModelo } from "@olula/lib/dominio.js";

interface TabGeneralProps {
    form: FormModelo;
    publicar: EmitirEvento;
}

export const TabGeneral = ({ form }: TabGeneralProps) => {
    const { uiProps } = form;

    return (
        <div className="TabGeneral">
            <quimera-formulario>
                <QInput label="ID" {...uiProps("id")} deshabilitado />
                <QInput label="Nombre" {...uiProps("nombre")} />
                <QInput label="Cadena de conexión (cifrada, solo lectura)" {...uiProps("cadenaConexionCifrada")} deshabilitado />
                <QCheckbox label="Activo" {...uiProps("activo")} />
            </quimera-formulario>
        </div>
    );
};

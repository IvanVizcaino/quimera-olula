import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";

export const TabGeneral = ({ form }: { form: FormModelo }) => {
    const { uiProps } = form;
    return (
        <div className="TabGeneral">
            <quimera-formulario>
                <QInput label="Código" {...uiProps("id")} soloLectura />
                <QInput label="Descripción" {...uiProps("descripcion")} />
                <QInput label="Concatenar con" {...uiProps("concatenar")} />
            </quimera-formulario>
            <p className="ayuda">
                «Concatenar con» es el código de la plantilla del asiento que se
                propone crear a continuación, con las mismas variables.
            </p>
        </div>
    );
};

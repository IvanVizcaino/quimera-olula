import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import "./TabGeneral.css";

interface TabGeneralProps {
    form: FormModelo;
}

export const TabGeneral = ({ form }: TabGeneralProps) => {

    const { uiProps } = form;

    return (
        <div className="TabGeneral">
            <quimera-formulario>
                <QInput label="Nombre" {...uiProps("nombre")} />
                <QInput label="CIF / NIF" {...uiProps("cifNif")} />
                <QInput label="Administrador" {...uiProps("administrador")} />
                <QInput label="Ejercicio" {...uiProps("ejercicioId")} />
                <QInput label="Teléfono" {...uiProps("telefono")} />
                <QInput label="Email" {...uiProps("email")} />
                <QInput label="Web" {...uiProps("web")} />
            </quimera-formulario>
        </div>
    );
};

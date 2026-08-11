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
                <QInput label="Descripción" {...uiProps("descripcion")} />
                <QInput label="IBAN" {...uiProps("iban")} />
                <QInput label="BIC / SWIFT" {...uiProps("bic")} />
                <QInput label="Entidad" {...uiProps("entidad")} />
                <QInput label="Agencia" {...uiProps("agencia")} />
            </quimera-formulario>
        </div>
    );
};

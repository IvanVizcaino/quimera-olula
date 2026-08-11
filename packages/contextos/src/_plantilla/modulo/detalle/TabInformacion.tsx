import { QInput } from "@olula/componentes/index.js";
import { FormModelo } from "@olula/lib/dominio.js";

interface TabInformacionProps {
    form: FormModelo;
}

export const TabInformacion = ({
  form,
}: TabInformacionProps) => {

    const { uiProps } = form;

    return (
        <div className="TabInformacion">
            <quimera-formulario>
                <QInput label="Campo Texto" {...uiProps("texto")} />
            </quimera-formulario>
        </div>
    );
};

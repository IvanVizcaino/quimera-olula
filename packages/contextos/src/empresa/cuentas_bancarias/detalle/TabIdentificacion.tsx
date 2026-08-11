import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import "./TabIdentificacion.css";

interface TabIdentificacionProps {
    form: FormModelo;
}

export const TabIdentificacion = ({ form }: TabIdentificacionProps) => {

    const { uiProps } = form;

    return (
        <div className="TabIdentificacion">
            <quimera-formulario>
                <QInput label="Código de cuenta" {...uiProps("codigoCuenta")} />
                <QInput label="País" {...uiProps("paisId")} />
                <QInput label="Dígito control" {...uiProps("digitoControl")} />
                <QInput label="Número de cuenta" {...uiProps("cuenta")} />
                <QInput label="Empresa" {...uiProps("empresaId")} />
                <QInput label="Obsoleta" {...uiProps("obsoleta")} />
            </quimera-formulario>
        </div>
    );
};

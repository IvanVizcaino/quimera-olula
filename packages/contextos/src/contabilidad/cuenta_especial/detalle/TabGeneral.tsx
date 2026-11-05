import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { CuentaEspecial } from "../diseño.ts";

interface TabGeneralProps {
    form: FormModelo;
    cuentaEspecial: CuentaEspecial;
}

export const TabGeneral = ({ form, cuentaEspecial }: TabGeneralProps) => {

    const { uiProps } = form;

    return (
        <div className="TabGeneral">
            <quimera-formulario>
                <QInput
                    label="Código"
                    nombre="id"
                    valor={cuentaEspecial.id}
                    soloLectura
                />
                <QInput label="Descripción" {...uiProps("descripcion")} />
                <QInput label="Cuenta" {...uiProps("codigoCuenta")} />
                <QInput label="Subcuenta" {...uiProps("codigoSubcuenta")} />
            </quimera-formulario>
        </div>
    );
};

import { CuentaBancaria } from "#/tesoreria/comun/componentes/cuenta_bancaria.tsx";
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
                <QInput label="Tipo" {...uiProps("tipo")} />
                <QInput label="Fecha" {...uiProps("fecha")} />
                <QInput label="Fecha de pago prevista" {...uiProps("fechaPago")} />
                <QInput label="Estado" {...uiProps("estado")} />
                <CuentaBancaria
                    label="Cuenta"
                    {...uiProps("cuentaId", "descripcionCuenta")}
                    soloLectura
                />
                <QInput label="Total" {...uiProps("total")} />
                <QInput label="Divisa" {...uiProps("divisaId")} />
                <QInput label="Empresa" {...uiProps("empresaId")} />
            </quimera-formulario>
        </div>
    );
};

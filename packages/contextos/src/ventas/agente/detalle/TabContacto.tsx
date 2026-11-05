import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import "./TabContacto.css";

interface TabContactoProps {
    form: FormModelo;
}

export const TabContacto = ({ form }: TabContactoProps) => {

    const { uiProps } = form;

    return (
        <div className="TabContacto">
            <quimera-formulario>
                <QInput label="Teléfono" {...uiProps("telefono")} />
                <QInput label="Email" {...uiProps("email")} />
                <QInput label="Dirección" {...uiProps("direccion")} />
                <QInput label="Código postal" {...uiProps("codpostal")} />
                <QInput label="Ciudad" {...uiProps("ciudad")} />
                <QInput label="Provincia" {...uiProps("provincia")} />
            </quimera-formulario>
        </div>
    );
};

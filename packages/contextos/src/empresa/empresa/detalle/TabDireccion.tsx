import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import "./TabDireccion.css";

interface TabDireccionProps {
    form: FormModelo;
}

export const TabDireccion = ({ form }: TabDireccionProps) => {

    const { uiProps } = form;

    return (
        <div className="TabDireccion">
            <quimera-formulario>
                <QInput label="Tipo de vía" {...uiProps("tipoVia")} />
                <QInput label="Nombre de vía" {...uiProps("nombreVia")} />
                <QInput label="Número" {...uiProps("numero")} />
                <QInput label="Otros" {...uiProps("otros")} />
                <QInput label="Cód. postal" {...uiProps("codPostal")} />
                <QInput label="Ciudad" {...uiProps("ciudad")} />
                <QInput label="Provincia (id)" {...uiProps("provinciaId")} />
                <QInput label="Provincia" {...uiProps("provincia")} />
                <QInput label="País" {...uiProps("paisId")} />
                <QInput label="Apartado" {...uiProps("apartado")} />
                <QInput label="Teléfono" {...uiProps("telefonoDireccion")} />
            </quimera-formulario>
        </div>
    );
};

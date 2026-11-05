import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { GrupoEpigrafe } from "../diseño.ts";

interface TabGeneralProps {
    form: FormModelo;
    grupo: GrupoEpigrafe;
}

export const TabGeneral = ({ form, grupo }: TabGeneralProps) => {

    const { uiProps } = form;

    return (
        <div className="TabGeneral">
            <quimera-formulario>
                <QInput label="Código" {...uiProps("codigo")} />
                <QInput label="Descripción" {...uiProps("descripcion")} />
                <QInput
                    label="Ejercicio"
                    nombre="ejercicio_id"
                    valor={grupo.ejercicioId}
                    soloLectura
                />
            </quimera-formulario>
        </div>
    );
};

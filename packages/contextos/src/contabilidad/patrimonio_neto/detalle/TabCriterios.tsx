import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";

interface TabCriteriosProps {
    form: FormModelo;
}

/** Pestaña «Criterios» de `co_i_patrimonio.ui`: descripción, ejercicio
 * actual y ejercicios anteriores. */
export const TabCriterios = ({ form }: TabCriteriosProps) => {
    const { uiProps } = form;

    return (
        <div className="TabCriterios">
            <quimera-formulario>
                <QInput label="Descripción" {...uiProps("descripcion")} />
                <QInput label="Ejercicio actual" {...uiProps("ejercicioId")} />
                <QInput
                    label="Ejercicio X-1"
                    {...uiProps("ejercicioAnteriorId")}
                    opcional
                />
                <QInput
                    label="Ejercicio X-2"
                    {...uiProps("ejercicioAnteriorAnteriorId")}
                    opcional
                />
            </quimera-formulario>
        </div>
    );
};

import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QBoton } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { FormModelo } from "@olula/lib/dominio.js";
import "./TabGeneral.css";

/**
 * Tab General: formulario de edición del módulo.
 *
 * Layout: usa <quimera-formulario> (grid de 12 columnas).
 * El posicionado de cada campo se controla en TabGeneral.css
 * mediante selectores de atributo sobre el elemento renderizado:
 *
 *   quimera-input[nombre="nombre"]   { grid-column: span 9; }
 *   quimera-select[nombre="estado"]  { grid-column: span 3; }
 *
 * El atributo `nombre` llega automáticamente al spread de uiProps("campo").
 */
interface TabGeneralProps {
    form: FormModelo;
    publicar: EmitirEvento;
}


export const TabGeneral = ({
  form,
  publicar = async () => {},
}: TabGeneralProps) => {

    const { uiProps, editable } = form;

    return (
        <div className="TabGeneral">
            <quimera-formulario>
                <QInput label="Campo String" {...uiProps("campoString")} />
                <QSelect
                    label="Opcion"
                    {...uiProps("campoOpcion")}
                    opciones={[
                        { valor: "opcion1", descripcion: "Opción 1" },
                        { valor: "opcion2", descripcion: "Opción 2" },
                    ]}
                />
                <QBoton texto='Accion Tab General'
                    onClick={() => publicar("borrado_solicitado")}
                    deshabilitado={!editable}
                />
                <QInput label="Campo Número" {...uiProps("campoNumero")} />
            </quimera-formulario>
        </div>
    );
};

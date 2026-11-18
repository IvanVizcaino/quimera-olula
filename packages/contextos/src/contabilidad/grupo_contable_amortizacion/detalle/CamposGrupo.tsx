import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FilaFormulario } from "#/contabilidad/comun/componentes/FilaFormulario.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { RolSubcuentaGrupo } from "../diseño.ts";
import { ROLES_SUBCUENTA } from "../dominio.ts";

type UiProps = FormModelo["uiProps"];

/** Campos del formulario de Eneboo `co_gruposcontablesamo.ui`. Los códigos con
 * punto ("681.1") los completa el servidor con la longitud del ejercicio.
 * En la ficha, el nombre de cada subcuenta va al lado de su código. */
export const CamposGrupo = ({
    uiProps,
    descripciones,
}: {
    uiProps: UiProps;
    descripciones?: Record<RolSubcuentaGrupo, string>;
}) => (
    <>
        <QInput label="Descripción" {...uiProps("descripcion")} />
        {ROLES_SUBCUENTA.map(({ rol, campo, etiqueta }) => (
            <FilaFormulario
                key={rol}
                columnas={descripciones ? "minmax(0, 1fr) minmax(0, 2fr)" : undefined}
            >
                <QInput label={etiqueta} {...uiProps(campo)} />
                {descripciones && (
                    <QInput
                        label="Nombre"
                        nombre={`nombre_${rol}`}
                        valor={descripciones[rol]}
                        soloLectura
                    />
                )}
            </FilaFormulario>
        ))}
    </>
);

import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { NATURALEZAS } from "../dominio.ts";

type UiProps = FormModelo["uiProps"];

/** Campos del formulario de Eneboo `co_codbalances08.ui` (pestaña «Cuentas
 * normales»: naturaleza y los cuatro niveles con su descripción). */
export const CamposCodigoBalance = ({ uiProps }: { uiProps: UiProps }) => (
    <>
        <QSelect label="Naturaleza" opciones={NATURALEZAS} {...uiProps("naturaleza")} />
        <QInput label="Código nivel 1" {...uiProps("nivel1")} />
        <QInput label="Descripción nivel 1" {...uiProps("descripcion1")} />
        <QInput label="Código nivel 2" {...uiProps("nivel2")} />
        <QInput label="Descripción nivel 2" {...uiProps("descripcion2")} />
        <QInput label="Código nivel 3" {...uiProps("nivel3")} />
        <QInput label="Descripción nivel 3" {...uiProps("descripcion3")} />
        <QInput label="Código nivel 4" {...uiProps("nivel4")} />
        <QInput label="Descripción nivel 4" {...uiProps("descripcion4")} />
    </>
);

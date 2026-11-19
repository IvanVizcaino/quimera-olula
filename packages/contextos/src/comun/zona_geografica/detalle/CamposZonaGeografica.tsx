import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";

type UiProps = FormModelo["uiProps"];

/** Campos de Eneboo `zonasgeo.ui`. */
export const CamposZonaGeografica = ({ uiProps }: { uiProps: UiProps }) => (
    <QInput label="Descripción" {...uiProps("descripcion")} />
);

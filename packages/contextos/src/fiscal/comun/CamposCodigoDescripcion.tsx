import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { UiProps } from "./maestro/diseño.ts";

export const CamposCodigoDescripcion = ({ uiProps }: { uiProps: UiProps }) => (
    <QInput label="Descripción" {...uiProps("descripcion")} />
);

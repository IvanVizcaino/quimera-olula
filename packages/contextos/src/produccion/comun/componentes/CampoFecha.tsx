import { QDate, QDateProps } from "@olula/componentes/atomos/qdate.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { fechaDdMmAaaa } from "../dominio.ts";

/**
 * Fecha "AAAA-MM-DD" del modelo: campo de fecha o, en solo lectura (que `QDate` no tiene), el
 * texto en dd/mm/aaaa. Se usa con `{...uiProps("campo")}`; `tipo` se fija a fecha.
 */
export const CampoFecha = ({ soloLectura, valor, ...props }: QDateProps & { soloLectura?: boolean }) =>
    soloLectura ? (
        <QInput label={props.label} nombre={props.nombre} valor={fechaDdMmAaaa(valor as string)} soloLectura />
    ) : (
        <QDate {...props} valor={valor} tipo="fecha" />
    );

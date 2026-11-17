import { FechaInforme } from "#/contabilidad/comun/componentes/FechaInforme.tsx";
import { FilaFormulario } from "#/contabilidad/comun/componentes/FilaFormulario.tsx";
import {
    FormatoCuentasAnuales,
    NivelDesgloseCuentasAnuales,
    TipoCuentasAnuales,
} from "#/contabilidad/comun/componentes/OpcionesCuentasAnuales.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { CuentasAnuales } from "../diseño.ts";
import { admiteDesglose, admiteOmitirEpigrafes } from "../dominio.ts";

/** Criterios de las cuentas anuales, iguales en el alta y en la ficha (la
 * casilla de omitir epígrafes sin saldo solo está en la ficha). */
export const CamposCuentasAnuales = ({
    uiProps,
    informe,
    conOmitirEpigrafes = false,
    refDescripcion,
}: {
    uiProps: FormModelo["uiProps"];
    informe: Pick<CuentasAnuales, "tipo" | "formato">;
    conOmitirEpigrafes?: boolean;
    refDescripcion?: ReturnType<typeof useFocus>;
}) => (
    <>
        <QInput label="Descripción" {...uiProps("descripcion")} ref={refDescripcion} />
        <FilaFormulario>
            <TipoCuentasAnuales {...uiProps("tipo")} />
            <FormatoCuentasAnuales {...uiProps("formato")} />
            <NivelDesgloseCuentasAnuales
                {...uiProps("nivelDesglose")}
                soloLectura={!admiteDesglose(informe.formato)}
            />
        </FilaFormulario>
        {conOmitirEpigrafes && (
            <QCheckbox
                label="Omitir epígrafes sin saldo"
                {...uiProps("omitirEpigrafesSinSaldo")}
                soloLectura={!admiteOmitirEpigrafes(informe.tipo)}
            />
        )}
        <FilaFormulario>
            <QInput label="Ejercicio" {...uiProps("ejercicioId")} />
            <FechaInforme label="Fecha desde" {...uiProps("fechaDesde")} />
            <FechaInforme label="Fecha hasta" {...uiProps("fechaHasta")} />
        </FilaFormulario>
        <FilaFormulario>
            <QInput label="Ejercicio anterior" {...uiProps("ejercicioAnteriorId")} opcional />
            <FechaInforme label="Fecha desde anterior" {...uiProps("fechaDesdeAnterior")} />
            <FechaInforme label="Fecha hasta anterior" {...uiProps("fechaHastaAnterior")} />
        </FilaFormulario>
    </>
);

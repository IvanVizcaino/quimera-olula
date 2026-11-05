import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import {
    FormatoCuentasAnuales,
    NivelDesgloseCuentasAnuales,
    TipoCuentasAnuales,
} from "#/contabilidad/comun/componentes/OpcionesCuentasAnuales.tsx";
import { CuentasAnuales } from "../diseño.ts";
import { admiteDesglose, admiteOmitirEpigrafes } from "../dominio.ts";

interface TabCriteriosProps {
    form: FormModelo;
    informe: CuentasAnuales;
}

export const TabCriterios = ({ form, informe }: TabCriteriosProps) => {
    const { uiProps } = form;

    return (
        <div className="TabCriterios">
            <quimera-formulario>
                <QInput label="Descripción" {...uiProps("descripcion")} />
                <TipoCuentasAnuales {...uiProps("tipo")} />
                <FormatoCuentasAnuales {...uiProps("formato")} />
                <NivelDesgloseCuentasAnuales
                    {...uiProps("nivelDesglose")}
                    soloLectura={!admiteDesglose(informe.formato)}
                />
                <QCheckbox
                    label="Omitir epígrafes sin saldo"
                    {...uiProps("omitirEpigrafesSinSaldo")}
                    soloLectura={!admiteOmitirEpigrafes(informe.tipo)}
                />
            </quimera-formulario>

            <quimera-formulario>
                <QInput label="Ejercicio" {...uiProps("ejercicioId")} />
                <QDate label="Fecha desde" {...uiProps("fechaDesde")} opcional />
                <QDate label="Fecha hasta" {...uiProps("fechaHasta")} opcional />
            </quimera-formulario>

            <quimera-formulario>
                <QInput
                    label="Ejercicio anterior"
                    {...uiProps("ejercicioAnteriorId")}
                    opcional
                />
                <QDate label="Fecha desde anterior" {...uiProps("fechaDesdeAnterior")} opcional />
                <QDate label="Fecha hasta anterior" {...uiProps("fechaHastaAnterior")} opcional />
            </quimera-formulario>
        </div>
    );
};

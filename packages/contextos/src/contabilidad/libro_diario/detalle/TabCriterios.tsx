import {
    CriterioOrdenInforme,
    SentidoOrdenInforme,
} from "#/contabilidad/comun/componentes/OpcionesLibroDiario.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { LibroDiario } from "../diseño.ts";
import { admiteOpcionesDeDetalle } from "../dominio.ts";

interface TabCriteriosProps {
    form: FormModelo;
    informe: LibroDiario;
}

export const TabCriterios = ({ form, informe }: TabCriteriosProps) => {
    const { uiProps } = form;

    // `controlChecks` de Eneboo: con resumen mensual no hay ni datos de
    // I.V.A. ni agrupación por meses.
    const conDetalle = admiteOpcionesDeDetalle(informe);

    return (
        <div className="TabCriterios">
            <quimera-formulario>
                <QInput label="Descripción" {...uiProps("descripcion")} />
                <QInput label="Ejercicio" {...uiProps("ejercicioId")} />
                <QDate label="Desde fecha" {...uiProps("fechaDesde")} opcional />
                <QDate label="Hasta fecha" {...uiProps("fechaHasta")} opcional />
            </quimera-formulario>

            <quimera-formulario>
                <QCheckbox
                    label="Todos los asientos"
                    {...uiProps("todosAsientos")}
                />
                <QInput
                    label="Desde asiento Nº"
                    {...uiProps("asientoDesde")}
                    soloLectura={informe.todosAsientos}
                    opcional
                />
                <QInput
                    label="Hasta asiento Nº"
                    {...uiProps("asientoHasta")}
                    soloLectura={informe.todosAsientos}
                    opcional
                />
            </quimera-formulario>

            <quimera-formulario>
                <QCheckbox
                    label="Todas las subcuentas"
                    {...uiProps("todasSubcuentas")}
                />
                <QInput
                    label="Desde subcuenta Nº"
                    {...uiProps("subcuentaDesde")}
                    soloLectura={informe.todasSubcuentas}
                    opcional
                />
                <QInput
                    label="Hasta subcuenta Nº"
                    {...uiProps("subcuentaHasta")}
                    soloLectura={informe.todasSubcuentas}
                    opcional
                />
            </quimera-formulario>

            <quimera-formulario>
                <QCheckbox label="Resumen mensual" {...uiProps("resumenMensual")} />
                <QCheckbox
                    label="Datos de I.V.A."
                    {...uiProps("datosIva")}
                    soloLectura={!conDetalle}
                />
                <QCheckbox
                    label="Agrupar por meses"
                    {...uiProps("agruparMeses")}
                    soloLectura={!conDetalle}
                />
            </quimera-formulario>

            <quimera-formulario>
                <CriterioOrdenInforme
                    label="Criterio 1"
                    {...uiProps("orden1")}
                />
                <SentidoOrdenInforme label="Orden 1" {...uiProps("tipoOrden1")} />
                <CriterioOrdenInforme
                    label="Criterio 2"
                    {...uiProps("orden2")}
                />
                <SentidoOrdenInforme label="Orden 2" {...uiProps("tipoOrden2")} />
                <CriterioOrdenInforme
                    label="Criterio 3"
                    {...uiProps("orden3")}
                />
                <SentidoOrdenInforme label="Orden 3" {...uiProps("tipoOrden3")} />
            </quimera-formulario>
        </div>
    );
};

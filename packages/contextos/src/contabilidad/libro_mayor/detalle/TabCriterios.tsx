import { CriterioOrdenMayor } from "#/contabilidad/comun/componentes/OpcionesLibroMayor.tsx";
import { SentidoOrdenInforme } from "#/contabilidad/comun/componentes/OpcionesLibroDiario.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { LibroMayor } from "../diseño.ts";

interface TabCriteriosProps {
    form: FormModelo;
    informe: LibroMayor;
}

export const TabCriterios = ({ form, informe }: TabCriteriosProps) => {
    const { uiProps } = form;

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
                <QCheckbox label="Saldo inicial" {...uiProps("saldoInicial")} />
                <QCheckbox
                    label="Excluir partidas a cero"
                    {...uiProps("excluirPartidasCero")}
                />
                <CriterioOrdenMayor label="Criterio" {...uiProps("orden")} />
                <SentidoOrdenInforme label="Orden" {...uiProps("tipoOrden")} />
            </quimera-formulario>
        </div>
    );
};

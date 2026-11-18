import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { LibroFacturasRecibidas } from "../diseño.ts";
import { admiteNumeroDesde, admitePorcentaje } from "../dominio.ts";

interface TabCriteriosProps {
    form: FormModelo;
    informe: LibroFacturasRecibidas;
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
                <QCheckbox label="Todos los tipos de I.V.A." {...uiProps("todos")} />
                <QInput
                    label="% de I.V.A."
                    {...uiProps("porcentaje")}
                    soloLectura={!admitePorcentaje(informe)}
                    opcional
                />
                <QCheckbox label="Solo con I.V.A." {...uiProps("conIva")} />
                <QInput
                    label="Serie"
                    {...uiProps("codigoSerie")}
                    opcional
                />
            </quimera-formulario>

            <quimera-formulario>
                <QCheckbox
                    label="Mostrar total factura"
                    {...uiProps("mostrarTotalFactura")}
                />
                <QCheckbox label="Mostrar NIF" {...uiProps("mostrarNif")} />
                <QCheckbox
                    label="Mostrar documento"
                    {...uiProps("mostrarDocumento")}
                />
                <QCheckbox
                    label="Mostrar asiento"
                    {...uiProps("mostrarAsiento")}
                />
                <QCheckbox
                    label="Numeración automática"
                    {...uiProps("numeracionAutomatica")}
                />
                <QInput
                    label="Numerar desde"
                    {...uiProps("numeroDesde")}
                    soloLectura={!admiteNumeroDesde(informe)}
                    opcional
                />
            </quimera-formulario>
        </div>
    );
};

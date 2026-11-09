import { Agente } from "#/ventas/comun/componentes/agente.tsx";
import { Cliente } from "#/ventas/comun/componentes/cliente.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { NuevaComparativaVentas } from "../diseño.ts";
import { admiteFechas, opcionesBusquedaAgente } from "../dominio.ts";

export const CamposCriterios = ({
    form,
    comparativa,
}: {
    form: FormModelo;
    comparativa: NuevaComparativaVentas;
}) => {
    const { uiProps } = form;
    const conFechas = admiteFechas(comparativa);

    return (
        <>
            <quimera-formulario>
                <QInput label="Año desde" {...uiProps("anioDesde")} />
                <QInput label="Año hasta" {...uiProps("anioHasta")} />
                <QDate
                    label="Desde fecha"
                    {...uiProps("fechaDesde")}
                    deshabilitado={!conFechas}
                    opcional
                />
                <QDate
                    label="Hasta fecha"
                    {...uiProps("fechaHasta")}
                    deshabilitado={!conFechas}
                    opcional
                />
                <QCheckbox label="Mostrar objetivo" {...uiProps("mostrarObjetivo")} />
            </quimera-formulario>

            <quimera-formulario>
                <Cliente {...uiProps("clienteId", "nombreCliente")} opcional />
                <Agente {...uiProps("agenteId", "nombreAgente")} opcional />
                <QSelect
                    label="Búsqueda de agente"
                    {...uiProps("busquedaAgente")}
                    opciones={opcionesBusquedaAgente}
                />
                <QInput label="Provincia (id)" {...uiProps("provinciaId")} opcional />
            </quimera-formulario>
        </>
    );
};

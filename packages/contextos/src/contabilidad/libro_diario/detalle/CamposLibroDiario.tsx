import {
    CriterioOrdenInforme,
    SentidoOrdenInforme,
} from "#/contabilidad/comun/componentes/OpcionesLibroDiario.tsx";
import { FechaInforme } from "#/contabilidad/comun/componentes/FechaInforme.tsx";
import { FilaFormulario } from "#/contabilidad/comun/componentes/FilaFormulario.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { LibroDiario } from "../diseño.ts";
import { admiteOpcionesDeDetalle } from "../dominio.ts";

type Informe = Pick<LibroDiario, "todosAsientos" | "todasSubcuentas" | "resumenMensual">;

/** Criterios del libro diario, iguales en el alta y en la ficha: cada rango
 * con su casilla en una fila y los tres niveles de orden en filas propias. */
export const CamposLibroDiario = ({
    uiProps,
    informe,
    refDescripcion,
}: {
    uiProps: FormModelo["uiProps"];
    informe: Informe;
    refDescripcion?: ReturnType<typeof useFocus>;
}) => {
    // `controlChecks` de Eneboo: con resumen mensual no hay ni datos de
    // I.V.A. ni agrupación por meses.
    const conDetalle = admiteOpcionesDeDetalle(informe);

    return (
        <>
            <QInput label="Descripción" {...uiProps("descripcion")} ref={refDescripcion} />
            <FilaFormulario>
                <QInput label="Ejercicio" {...uiProps("ejercicioId")} />
                <FechaInforme label="Desde fecha" {...uiProps("fechaDesde")} />
                <FechaInforme label="Hasta fecha" {...uiProps("fechaHasta")} />
            </FilaFormulario>
            <FilaFormulario>
                <QCheckbox label="Todos los asientos" {...uiProps("todosAsientos")} />
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
            </FilaFormulario>
            <FilaFormulario>
                <QCheckbox label="Todas las subcuentas" {...uiProps("todasSubcuentas")} />
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
            </FilaFormulario>
            <FilaFormulario>
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
            </FilaFormulario>
            {([1, 2, 3] as const).map((n) => (
                <FilaFormulario key={n}>
                    <CriterioOrdenInforme label={`Criterio ${n}`} {...uiProps(`orden${n}`)} />
                    <SentidoOrdenInforme label={`Orden ${n}`} {...uiProps(`tipoOrden${n}`)} />
                </FilaFormulario>
            ))}
        </>
    );
};

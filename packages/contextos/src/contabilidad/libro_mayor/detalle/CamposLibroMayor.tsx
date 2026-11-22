import { SentidoOrdenInforme } from "#/contabilidad/comun/componentes/OpcionesLibroDiario.tsx";
import { CriterioOrdenMayor } from "#/contabilidad/comun/componentes/OpcionesLibroMayor.tsx";
import { FechaInforme } from "#/contabilidad/comun/componentes/FechaInforme.tsx";
import { FilaFormulario } from "#/contabilidad/comun/componentes/FilaFormulario.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { LibroMayor } from "../diseño.ts";

/** Criterios del libro mayor, iguales en el alta y en la ficha. */
export const CamposLibroMayor = ({
    uiProps,
    informe,
    refDescripcion,
}: {
    uiProps: FormModelo["uiProps"];
    informe: Pick<LibroMayor, "todasSubcuentas">;
    refDescripcion?: ReturnType<typeof useFocus>;
}) => (
    <>
        <QInput label="Descripción" {...uiProps("descripcion")} ref={refDescripcion} />
        <FilaFormulario>
            <QInput label="Ejercicio" {...uiProps("ejercicioId")} />
            <FechaInforme label="Desde fecha" {...uiProps("fechaDesde")} />
            <FechaInforme label="Hasta fecha" {...uiProps("fechaHasta")} />
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
            <QCheckbox label="Calcular saldo inicial" {...uiProps("saldoInicial")} />
            <QCheckbox label="Excluir partidas a cero" {...uiProps("excluirPartidasCero")} />
        </FilaFormulario>
        <FilaFormulario>
            <CriterioOrdenMayor label="Criterio" {...uiProps("orden")} />
            <SentidoOrdenInforme label="Orden" {...uiProps("tipoOrden")} />
        </FilaFormulario>
    </>
);

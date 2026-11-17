import { FechaInforme } from "#/contabilidad/comun/componentes/FechaInforme.tsx";
import { FilaFormulario } from "#/contabilidad/comun/componentes/FilaFormulario.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { useFocus } from "@olula/lib/useFocus.ts";

/**
 * Criterios de los libros de facturas emitidas y recibidas, iguales en el
 * alta y en la ficha. Las recibidas llevan además la serie, delante de la
 * casilla de todos los tipos de I.V.A. Cada módulo decide con su dominio si
 * el % de I.V.A. y el número inicial se pueden editar.
 */
export const CamposLibroIva = ({
    uiProps,
    porcentajeEditable,
    numeroDesdeEditable,
    conSerie = false,
    refDescripcion,
}: {
    uiProps: FormModelo["uiProps"];
    porcentajeEditable: boolean;
    numeroDesdeEditable: boolean;
    conSerie?: boolean;
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
            {conSerie && <QInput label="Serie" {...uiProps("codigoSerie")} opcional />}
            <QCheckbox label="Todos los tipos de I.V.A." {...uiProps("todos")} />
            <QInput
                label="% de I.V.A."
                {...uiProps("porcentaje")}
                soloLectura={!porcentajeEditable}
            />
        </FilaFormulario>
        <FilaFormulario>
            <QCheckbox label="Solo con I.V.A." {...uiProps("conIva")} />
            <QCheckbox label="Mostrar total factura" {...uiProps("mostrarTotalFactura")} />
            <QCheckbox label="Mostrar NIF" {...uiProps("mostrarNif")} />
            <QCheckbox label="Mostrar documento" {...uiProps("mostrarDocumento")} />
            <QCheckbox label="Mostrar asiento" {...uiProps("mostrarAsiento")} />
        </FilaFormulario>
        <FilaFormulario>
            <QCheckbox label="Numeración automática" {...uiProps("numeracionAutomatica")} />
            <QInput
                label="Numerar desde"
                {...uiProps("numeroDesde")}
                soloLectura={!numeroDesdeEditable}
                opcional
            />
        </FilaFormulario>
    </>
);

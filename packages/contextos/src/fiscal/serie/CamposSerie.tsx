import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { ejercicioActual } from "#/contabilidad/asiento/dominio.ts";
import { CampoCuenta, CampoSubcuenta } from "#/contabilidad/comun/componentes/CampoCodigoContable.tsx";
import { FilaFormulario } from "#/contabilidad/comun/componentes/FilaFormulario.tsx";
import { PropsCampos } from "../comun/maestro/diseño.ts";
import { Serie } from "./diseño.ts";

const informado = (valor: unknown) => typeof valor === "string" && valor.trim() !== "";

/** Formulario de series.ui: Impuestos, Contabilidad y Veri*Factu.
 * Cuenta y subcuenta de ventas se buscan en el ejercicio actual
 * (series.qs::init filtra por flfactppal.ejercicioActual) y, como en
 * series.qs::controlCtaSubcta, informar una deshabilita la otra. */
export const CamposSerie = ({ uiProps }: PropsCampos<Serie>) => {
    const ejercicioId = ejercicioActual();
    const cuenta = uiProps("codigoCuenta");
    const subcuenta = uiProps("codigoSubcuenta");
    return (
        <>
            <QInput label="Descripción" {...uiProps("descripcion")} />
            <h3>Impuestos</h3>
            <FilaFormulario>
                <QInput label="% I.R.P.F." {...uiProps("irpf")} />
                <QCheckbox label="Sin I.V.A." {...uiProps("sinIva")} />
            </FilaFormulario>
            <h3>Contabilidad</h3>
            <CampoCuenta label="Cuenta de ventas" ejercicioId={ejercicioId} {...cuenta}
                deshabilitado={informado(subcuenta.valor)} />
            <CampoSubcuenta label="Subcuenta de ventas" ejercicioId={ejercicioId} {...subcuenta}
                deshabilitado={informado(cuenta.valor)} />
            <h3>Veri*Factu</h3>
            <FilaFormulario>
                <QCheckbox label="Rectificativa" {...uiProps("rectificativa")} />
                <QCheckbox label="Simplificada" {...uiProps("simplificada")} />
            </FilaFormulario>
        </>
    );
};

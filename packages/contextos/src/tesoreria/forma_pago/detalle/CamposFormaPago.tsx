import { CuentaBancariaSelect } from "#/tesoreria/comun/componentes/cuenta_bancaria_select.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { opcionesGeneraRecibos, opcionesTipoPagoFacturae } from "../dominio.ts";

type UiProps = FormModelo["uiProps"];

/** Campos del grupo «Forma de Pago» de Eneboo `formaspago.ui`. */
export const CamposFormaPago = ({ uiProps }: { uiProps: UiProps }) => (
    <>
        <QInput label="Descripción" {...uiProps("descripcion")} />
        <QSelect
            label="Generar recibos como"
            opciones={opcionesGeneraRecibos}
            {...uiProps("generaRecibos")}
        />
        <CuentaBancariaSelect label="Cuenta" {...uiProps("cuentaId")} />
        <QCheckbox label="Pago por domiciliación" {...uiProps("domiciliado")} />
        <QSelect
            label="Pago Factura-e"
            opciones={opcionesTipoPagoFacturae}
            {...uiProps("tipoPagoFacturae")}
        />
    </>
);

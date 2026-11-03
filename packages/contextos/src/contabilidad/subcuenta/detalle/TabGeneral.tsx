import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { Subcuenta } from "../diseño.ts";

interface TabGeneralProps {
    form: FormModelo;
    subcuenta: Subcuenta;
}

export const TabGeneral = ({ form, subcuenta }: TabGeneralProps) => {

    const { uiProps } = form;

    return (
        <div className="TabGeneral">
            <quimera-formulario>
                <QInput
                    label="Código"
                    nombre="codigo"
                    valor={subcuenta.codigo}
                    soloLectura
                />
                <QInput label="Descripción" {...uiProps("nombre")} />
                <QInput
                    label="Cuenta (plan)"
                    nombre="codigo_cuenta"
                    valor={subcuenta.codigoCuenta}
                    soloLectura
                />
                <QInput
                    label="Ejercicio"
                    nombre="ejercicio_id"
                    valor={subcuenta.ejercicioId}
                    soloLectura
                />
                <QInput
                    label="Grupo de IVA"
                    nombre="impuesto_id"
                    valor={subcuenta.impuestoId}
                    soloLectura
                />
                <QInput
                    label="% I.V.A."
                    nombre="iva"
                    valor={String(subcuenta.iva)}
                    soloLectura
                />
                <QInput
                    label="% R. Equivalencia"
                    nombre="recargo"
                    valor={String(subcuenta.recargo)}
                    soloLectura
                />
                <QInput
                    label="Cuenta especial"
                    nombre="cuenta_especial_id"
                    valor={subcuenta.cuentaEspecialId}
                    soloLectura
                />
            </quimera-formulario>
        </div>
    );
};

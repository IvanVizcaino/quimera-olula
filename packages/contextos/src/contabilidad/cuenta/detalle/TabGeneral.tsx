import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { Cuenta } from "../diseño.ts";

interface TabGeneralProps {
    form: FormModelo;
    cuenta: Cuenta;
}

export const TabGeneral = ({ form, cuenta }: TabGeneralProps) => {

    const { uiProps } = form;

    return (
        <div className="TabGeneral">
            <quimera-formulario>
                <QInput
                    label="Código"
                    nombre="codigo"
                    valor={cuenta.codigo}
                    soloLectura
                />
                <QInput label="Descripción" {...uiProps("nombre")} />
                <QInput
                    label="Epígrafe"
                    nombre="codigo_epigrafe"
                    valor={cuenta.codigoEpigrafe ?? ""}
                    soloLectura
                />
                <QInput
                    label="Ejercicio"
                    nombre="ejercicio_id"
                    valor={cuenta.ejercicioId}
                    soloLectura
                />
                <QInput
                    label="Cuenta especial"
                    nombre="cuenta_especial_id"
                    valor={cuenta.cuentaEspecialId}
                    soloLectura
                />
            </quimera-formulario>
        </div>
    );
};

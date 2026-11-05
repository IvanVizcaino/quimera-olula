import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { FormModelo } from "@olula/lib/dominio.js";
import { ClienteTenant } from "../../comun/componentes/clienteTenant.js";

interface TabGeneralProps {
    form: FormModelo;
    publicar: EmitirEvento;
}

export const TabGeneral = ({ form }: TabGeneralProps) => {
    const { uiProps } = form;

    const clienteIdProps = uiProps("clienteId");

    return (
        <div className="TabGeneral">
            <quimera-formulario>
                <QInput label="ID" {...uiProps("id")} deshabilitado />
                <QInput label="Nombre" {...uiProps("nombre")} />
                <QInput label="Email" {...uiProps("email")} tipo="email" />
                <ClienteTenant
                    valor={clienteIdProps.valor as string}
                    onChange={(opcion) =>
                        (clienteIdProps.onChange as (v: string) => void)(opcion?.valor ?? "")
                    }
                />
                <QCheckbox label="Activo" {...uiProps("activo")} />
            </quimera-formulario>
        </div>
    );
};

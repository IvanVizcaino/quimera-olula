import { opcionesTipoIdFiscalCompras } from "#/compras/comun/valores.ts";
import { TipoIdFiscal } from "#/comun/componentes/tipoIdFiscal.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { pluginActivo } from "@olula/lib/plugins.tsx";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { Proveedor } from "../diseño.ts";
import "./TabGeneral.css";

export const TabGeneral = ({
    form,
    proveedor,
}: {
    form: HookModelo<Proveedor>;
    proveedor: Proveedor;
}) => {
    const { uiProps } = form;
    const conPersonaFisica = pluginActivo("persona_fisica");

    return (
        <div className="TabGeneral">
            <quimera-formulario>
                {conPersonaFisica && (
                    <QCheckbox label="Persona física" {...uiProps("personaFisica")} />
                )}
                {(!conPersonaFisica || !proveedor.personaFisica) && (
                    <QInput label="Nombre" {...uiProps("nombre")} />
                )}
                {conPersonaFisica && proveedor.personaFisica && (
                    <>
                        <QInput label="Nombre de pila" {...uiProps("nombrePila")} />
                        <QInput label="Apellidos" {...uiProps("apellidos")} />
                    </>
                )}
                <QInput label="Nombre Comercial" {...uiProps("nombreComercial")} />
                <TipoIdFiscal
                    {...uiProps("tipoIdFiscal")}
                    opciones={opcionesTipoIdFiscalCompras}
                />
                <QInput label="Id Fiscal" {...uiProps("idFiscal")} />
                <QInput label="Teléfono 1" {...uiProps("telefono1")} />
                <QInput label="Teléfono 2" {...uiProps("telefono2")} />
                <QInput label="Email" {...uiProps("email")} />
                <QInput label="Web" {...uiProps("web")} />
                {proveedor.deBaja && (
                    <QDate label="Fecha Baja" {...uiProps("fechaBaja")} />
                )}
                <QTextArea label="Observaciones" {...uiProps("observaciones")} />
            </quimera-formulario>
        </div>
    );
};

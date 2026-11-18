import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { CodigoBalance } from "../diseño.ts";
import { CamposCodigoBalance } from "./CamposCodigoBalance.tsx";

export const TabGeneral = ({
    form,
    codigoBalance,
}: {
    form: FormModelo;
    codigoBalance: CodigoBalance;
}) => (
    <div className="TabGeneral">
        <quimera-formulario>
            <QInput label="Código" nombre="id" valor={codigoBalance.id} soloLectura />
            <CamposCodigoBalance uiProps={form.uiProps} />
        </quimera-formulario>
    </div>
);

import { Divisa } from "#/ventas/comun/componentes/divisa.tsx";
import { FormaPago } from "#/ventas/comun/componentes/formapago.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import "./TabComercial.css";

interface TabComercialProps {
    form: FormModelo;
}

export const TabComercial = ({ form }: TabComercialProps) => {

    const { uiProps } = form;

    return (
        <div className="TabComercial">
            <quimera-formulario>
                <Divisa {...uiProps("divisaId")} nombre="empresa/divisa_id" />
                <FormaPago {...uiProps("formaPagoId")} nombre="empresa/forma_pago_id" />
                <QInput label="Serie" {...uiProps("serieId")} nombre="empresa/serie_id" />
                <QInput label="Almacén" {...uiProps("almacenId")} nombre="empresa/almacen_id" />
            </quimera-formulario>
        </div>
    );
};

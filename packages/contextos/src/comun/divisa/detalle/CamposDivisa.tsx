import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { FormModelo } from "@olula/lib/dominio.js";

type UiProps = FormModelo["uiProps"];

/** Campos de Eneboo `divisas.ui`. */
export const CamposDivisa = ({ uiProps }: { uiProps: UiProps }) => (
    <>
        <QInput label="Descripción" {...uiProps("descripcion")} />
        <QInput label="Símbolo" {...uiProps("simbolo")} />
        <QInput label="Código ISO" {...uiProps("codigoIso")} />
        <QInput label="Cifras decimales" {...uiProps("cifrasDecimales")} />
        <QInput label="Tasa de conversión" {...uiProps("tasaConversion")} />
        <QDate label="Fecha de actualización" {...uiProps("fecha")} />
        <QTextArea
            label="Monedas y billetes (p. ej. m0.05, m1, b5, b10)"
            {...uiProps("monedasBilletes")}
        />
    </>
);

import { PaisSelector } from "#/comun/componentes/pais/pais.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { FormModelo } from "@olula/lib/dominio.js";

type UiProps = FormModelo["uiProps"];

/** Campos de Eneboo `sucursales.mtd`. */
export const CamposSucursal = ({ uiProps }: { uiProps: UiProps }) => (
    <>
        <QInput label="Nº de oficina" {...uiProps("agencia")} />
        <QInput label="Nombre" {...uiProps("nombre")} />
        <QInput label="Dirección" {...uiProps("direccion")} />
        <QInput label="Código postal" {...uiProps("codigoPostal")} />
        <QInput label="Apdo. de correos" {...uiProps("apartado")} />
        <QInput label="Población" {...uiProps("poblacion")} />
        <QInput label="Provincia" {...uiProps("provincia")} />
        <PaisSelector label="País" {...uiProps("paisId")} />
        <QInput label="Teléfono" {...uiProps("telefono")} />
        <QInput label="Fax" {...uiProps("fax")} />
        <QInput label="Contacto" {...uiProps("contacto")} />
        <QTextArea label="Observaciones" {...uiProps("observaciones")} />
    </>
);

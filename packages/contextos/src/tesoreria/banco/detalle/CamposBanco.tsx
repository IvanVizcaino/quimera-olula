import { Proveedor } from "#/compras/comun/componentes/proveedor.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";

type UiProps = FormModelo["uiProps"];

/** Campos del grupo «Banco» de Eneboo `bancos.ui`. */
export const CamposBanco = ({
    uiProps,
    nombreProveedor = "",
}: {
    uiProps: UiProps;
    nombreProveedor?: string;
}) => (
    <>
        <QInput label="Nombre" {...uiProps("nombre")} />
        <Proveedor label="Acreedor" descripcion={nombreProveedor} {...uiProps("proveedorId")} />
        <QInput label="BIC por defecto" {...uiProps("bicDefecto")} />
    </>
);

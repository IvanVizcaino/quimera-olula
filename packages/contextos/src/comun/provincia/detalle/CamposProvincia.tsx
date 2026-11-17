import { PaisSelector } from "#/comun/componentes/pais/pais.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";

type UiProps = FormModelo["uiProps"];

/** Campos de Eneboo `provincias.ui`. */
export const CamposProvincia = ({
    uiProps,
    nombrePais = "",
}: {
    uiProps: UiProps;
    nombrePais?: string;
}) => (
    <>
        <QInput label="Provincia" {...uiProps("nombre")} />
        <QInput label="Código" {...uiProps("codigo")} />
        <PaisSelector label="País" descripcion={nombrePais} {...uiProps("paisId")} />
    </>
);

import { ZonaGeograficaSelect } from "#/comun/zona_geografica/componentes/ZonaGeograficaSelect.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { FormModelo } from "@olula/lib/dominio.js";

type UiProps = FormModelo["uiProps"];

/** Campos de Eneboo `paises.ui` (pestaña Principal y «Validar CIF/NIF»). */
export const CamposPais = ({ uiProps }: { uiProps: UiProps }) => (
    <>
        <QInput label="Nombre" {...uiProps("nombre")} />
        <QInput label="Código I.S.O." {...uiProps("codiso")} />
        <QInput label="Código I.S.O. Alpha 2" {...uiProps("codigoIsoAlpha2")} />
        <QInput label="Código I.S.O. Alpha 3" {...uiProps("codigoIsoAlpha3")} />
        <ZonaGeograficaSelect label="Zona geográfica" {...uiProps("zonaId")} />
        <QCheckbox label="Exigir validación de provincias" {...uiProps("validarProvincias")} />
        <QCheckbox label="Pertenece a zona SEPA" {...uiProps("zonaSepa")} />
        <QCheckbox label="Pertenece a U.E." {...uiProps("enUe")} />
        <QCheckbox label="Exigir validación del CIF/NIF" {...uiProps("exigirValidacion")} />
        <QTextArea label="Función de validación" {...uiProps("funcionValidacion")} />
    </>
);

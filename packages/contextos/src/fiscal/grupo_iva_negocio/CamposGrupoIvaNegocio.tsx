import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { ReactNode } from "react";
import { FilaFormulario } from "#/contabilidad/comun/componentes/FilaFormulario.tsx";
import { CampoCatalogoSii } from "../comun/CampoCatalogoSii.tsx";
import { UiProps } from "../comun/maestro/diseño.ts";
import FISCAL_Urls from "../comun/urls.ts";
import { useOpciones } from "../comun/useOpciones.ts";

const urls = new FISCAL_Urls();

const REGIMENES_IVA = [
    { valor: "", descripcion: "(Sin régimen)" },
    { valor: "General", descripcion: "General" },
    { valor: "Exportaciones", descripcion: "Exportaciones" },
    { valor: "U.E.", descripcion: "U.E." },
    { valor: "Exento", descripcion: "Exento" },
];

/** Formulario veri_gruposcontivaneg.ui: grupo, modelos, SII, Veri*Factu y
 * comportamiento del IVA. El Código lo pone aquí, en la fila de la descripción
 * (`codigoEnCampos`). */
export const CamposGrupoIvaNegocio = ({ uiProps, codigo }: { uiProps: UiProps; codigo?: ReactNode }) => {
    const regimenes = useOpciones(urls.REGIMEN_IVA_VERIFACTU);
    const causas = useOpciones(urls.CAUSA_EXENCION_IVA);
    const descripcion = <QInput label="Descripción" {...uiProps("descripcion")} />;
    return (
        <>
            {codigo ? <FilaFormulario columnas="1fr 3fr">{codigo}{descripcion}</FilaFormulario> : descripcion}
            <h3>Modelos</h3>
            <QCheckbox label="Asociar a modelo 349" {...uiProps("modelo349")} />
            <h3>SII</h3>
            <FilaFormulario>
                <CampoCatalogoSii catalogo="clavesEmitidas" label="Rég. especial emitidas"
                    {...uiProps("siiClaveOperacionEmitidas")} />
                <CampoCatalogoSii catalogo="clavesRecibidas" label="Rég. especial recibidas"
                    {...uiProps("siiClaveOperacionRecibidas")} />
            </FilaFormulario>
            <FilaFormulario>
                <CampoCatalogoSii catalogo="tiposOperacion" label="Operación sujeta - Tipo"
                    {...uiProps("siiTipoNoExentaEmitidas")} />
                <CampoCatalogoSii catalogo="tiposOperacion" label="Operación sujeta exenta - Causa"
                    {...uiProps("siiCausaExentaEmitidas")} />
            </FilaFormulario>
            <h3>Veri*Factu</h3>
            <FilaFormulario>
                <QSelect label="Régimen I.V.A." opciones={REGIMENES_IVA} {...uiProps("regimenIva")} />
                <QSelect label="Régimen I.V.A. Verifactu" opciones={regimenes}
                    {...uiProps("regimenIvaVerifactu")} />
            </FilaFormulario>
            <QSelect label="Causa exención IVA Verifactu" opciones={causas}
                {...uiProps("causaExencionIvaVerifactu")} />
            <h3>I.V.A.</h3>
            <FilaFormulario>
                <QCheckbox label="Inversión del sujeto pasivo" {...uiProps("isp")} />
                <QCheckbox label="Sin I.V.A." {...uiProps("sinIva")} />
                <QCheckbox label="Aplicar Recargo Eq." {...uiProps("aplicarRecargo")} />
                <QCheckbox label="Exenta" {...uiProps("siiExentaIva")} />
            </FilaFormulario>
            <FilaFormulario>
                <QCheckbox label="Servicios" {...uiProps("siiServicios")} />
                <QCheckbox label="Ventas a distancia" {...uiProps("ventasADistancia")} />
                <QCheckbox label="Agrario" {...uiProps("agrario")} />
                <QCheckbox label="Régimen Especial Criterio de Caja (RECC)" {...uiProps("criterioCaja")} />
            </FilaFormulario>
        </>
    );
};

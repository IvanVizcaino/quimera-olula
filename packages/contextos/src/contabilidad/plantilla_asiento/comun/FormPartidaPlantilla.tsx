import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { UiProps } from "@olula/lib/useModelo.ts";
import { CamposPartidaPlantilla } from "../diseño.ts";
import {
    OPCIONES_DEBE_HABER,
    OPCIONES_TIPO_BASE_IMPONIBLE,
    OPCIONES_TIPO_CONCEPTO,
    OPCIONES_TIPO_DOCUMENTO,
    OPCIONES_TIPO_DOCUMENTO_ORIGEN,
    OPCIONES_TIPO_FACTURA,
    OPCIONES_TIPO_IMPORTE,
    OPCIONES_TIPO_SUBCUENTA,
} from "../dominio.ts";
import "./FormPartidaPlantilla.css";


/**
 * Formulario de una partida predefinida (Eneboo `co_planpartidas.ui`).
 * Como el formulario de Eneboo, cada campo solo se ofrece cuando su tipo lo
 * usa: el código con Establecer/Pedir, la variable con Definida, la fórmula
 * con Calcular...
 */
export const FormPartidaPlantilla = ({
    modelo,
    uiProps,
}: {
    modelo: CamposPartidaPlantilla;
    uiProps: (campo: string) => UiProps;
}) => (
    <div className="FormPartidaPlantilla">
        <quimera-formulario>
            <QInput label="Nº de orden" {...uiProps("numeroOrden")} />
            <QSelect label="Debe / Haber" {...uiProps("debeHaber")} opciones={OPCIONES_DEBE_HABER} />
            <QCheckbox label="Saltar si es cero" {...uiProps("saltarSiCero")} />
        </quimera-formulario>

        <h4>Subcuenta</h4>
        <quimera-formulario>
            <QSelect label="Subcuenta" {...uiProps("tipoSubcuenta")} opciones={OPCIONES_TIPO_SUBCUENTA} />
            {modelo.tipoSubcuenta !== "Definida" && (
                <QInput label="Código" {...uiProps("codigoSubcuenta")} />
            )}
            <QInput label="Variable" {...uiProps("variableSubcuenta")} />
        </quimera-formulario>

        <h4>Importe</h4>
        <quimera-formulario>
            <QSelect label="Importe" {...uiProps("tipoImporte")} opciones={OPCIONES_TIPO_IMPORTE} />
            {modelo.tipoImporte === "Calcular" && (
                <QInput label="Fórmula (p. ej. BASE*21/100)" {...uiProps("importe")} />
            )}
            {modelo.tipoImporte !== "Cuadrar" && (
                <QInput label="Variable" {...uiProps("variableImporte")} />
            )}
        </quimera-formulario>

        <h4>Concepto</h4>
        <quimera-formulario>
            <QSelect label="Concepto" {...uiProps("tipoConcepto")} opciones={OPCIONES_TIPO_CONCEPTO} />
            {(modelo.tipoConcepto === "Establecer" || modelo.tipoConcepto === "Pedir") && (
                <QInput label="Texto" {...uiProps("concepto")} />
            )}
            {modelo.tipoConcepto !== "Último" && (
                <QInput label="Variable" {...uiProps("variableConcepto")} />
            )}
        </quimera-formulario>

        <h4>Documento</h4>
        <quimera-formulario>
            <QSelect label="Documento" {...uiProps("tipoDocumento")} opciones={OPCIONES_TIPO_DOCUMENTO} />
            {modelo.tipoDocumento !== "Último" && (
                <>
                    <QInput label="Documento (_NFAC_ = nº factura)" {...uiProps("documento")} />
                    <QSelect
                        label="Tipo de documento"
                        {...uiProps("tipoDocumentoOrigen")}
                        opciones={OPCIONES_TIPO_DOCUMENTO_ORIGEN}
                    />
                </>
            )}
        </quimera-formulario>

        <h4>IVA (solo si la subcuenta es de IVA)</h4>
        <quimera-formulario>
            <QSelect label="Base imponible" {...uiProps("tipoBaseImponible")} opciones={OPCIONES_TIPO_BASE_IMPONIBLE} />
            {modelo.tipoBaseImponible === "Calcular" && (
                <QInput label="Fórmula de la base" {...uiProps("baseImponible")} />
            )}
            <QInput label="Variable" {...uiProps("variableBaseImponible")} />
            <QSelect label="Nº de factura" {...uiProps("tipoFactura")} opciones={OPCIONES_TIPO_FACTURA} />
            <QInput label="Serie" {...uiProps("serieId")} />
        </quimera-formulario>

        <h4>Contrapartida</h4>
        <quimera-formulario>
            <QSelect label="Contrapartida" {...uiProps("tipoContrapartida")} opciones={OPCIONES_TIPO_SUBCUENTA} />
            {modelo.tipoContrapartida !== "Definida" && (
                <QInput label="Código" {...uiProps("codigoContrapartida")} />
            )}
            <QInput label="Variable" {...uiProps("variableContrapartida")} />
        </quimera-formulario>
    </div>
);

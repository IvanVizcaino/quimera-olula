import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { ejercicioActual } from "#/contabilidad/asiento/dominio.ts";
import { CampoSubcuenta } from "#/contabilidad/comun/componentes/CampoCodigoContable.tsx";
import { FilaFormulario } from "#/contabilidad/comun/componentes/FilaFormulario.tsx";
import { UiProps } from "../comun/maestro/diseño.ts";
import { SUBCUENTAS_COMPRAS, SUBCUENTAS_VENTAS, TIPOS_BIENES } from "./subcuentas.ts";

const opcionesTipoBienes = TIPOS_BIENES.map((t) => ({ valor: t, descripcion: t }));

const Subcuentas = ({ uiProps, lista, ejercicioId }: {
    uiProps: UiProps;
    lista: typeof SUBCUENTAS_COMPRAS;
    ejercicioId: string;
}) => (
    <quimera-formulario>
        {lista.map(({ sufijo, etiqueta }) => (
            <CampoSubcuenta key={sufijo} label={etiqueta} ejercicioId={ejercicioId}
                {...uiProps(`sc_${sufijo}`)} />
        ))}
    </quimera-formulario>
);

/** Formulario de impuestos.ui: porcentajes, tipo de bienes y las subcuentas
 * en las pestañas «Contabilidad Compras» y «Contabilidad Ventas» (tbwContabilidad).
 * Las subcuentas son del ejercicio actual (el mismo con el que se guardan). */
export const CamposImpuesto = ({ uiProps }: { uiProps: UiProps }) => {
    const ejercicioId = ejercicioActual();
    return (
        <>
            <QInput label="Descripción" {...uiProps("descripcion")} />
            <FilaFormulario>
                <QInput label="% I.V.A." {...uiProps("iva")} />
                <QInput label="% Rec. equivalencia" {...uiProps("recargo")} />
                <QSelect label="Tipo de bienes" opciones={opcionesTipoBienes} {...uiProps("tipoBienes")} />
            </FilaFormulario>
            <div className="CamposImpuesto-contabilidad">
                <Tabs children={[
                    <Tab key="compras" label="Contabilidad Compras">
                        <Subcuentas uiProps={uiProps} lista={SUBCUENTAS_COMPRAS} ejercicioId={ejercicioId} />
                    </Tab>,
                    <Tab key="ventas" label="Contabilidad Ventas">
                        <Subcuentas uiProps={uiProps} lista={SUBCUENTAS_VENTAS} ejercicioId={ejercicioId} />
                    </Tab>,
                ]} />
            </div>
        </>
    );
};

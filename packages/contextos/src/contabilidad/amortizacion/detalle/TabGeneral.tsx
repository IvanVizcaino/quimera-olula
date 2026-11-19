import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { useOpcionesGrupo } from "../crear/OpcionesGrupo.ts";
import { Amortizacion } from "../diseño.ts";
import { PERIODOS, planBloqueado } from "../dominio.ts";

const importe = (valor: number): string =>
    valor.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Pestaña «Datos generales» de `co_amortizaciones.ui`. Con dotaciones el
 * valor y el plan quedan de solo lectura, como en Eneboo. */
export const TabGeneral = ({
    form,
    amortizacion,
}: {
    form: FormModelo;
    amortizacion: Amortizacion;
}) => {
    const grupos = useOpcionesGrupo();
    const bloqueado = planBloqueado(amortizacion);
    const { uiProps } = form;
    const plan = (campo: string) => ({ ...uiProps(campo), deshabilitado: bloqueado });

    return (
        <div className="TabGeneral">
            <quimera-formulario>
                <QInput label="Código" nombre="id" valor={amortizacion.id} soloLectura />
                <QInput label="Estado" nombre="estado" valor={amortizacion.estado} soloLectura />
                <QInput label="Elemento de inmovilizado" {...uiProps("elemento")} />
                <QSelect label="Grupo contable" opciones={grupos} {...uiProps("grupoId")} />
                <QDate label="Fecha de adquisición" {...uiProps("fecha")} />
                <QDate label="Fecha de inicio" {...plan("fechaInicio")} />
                <QInput label="Valor de adquisición" {...plan("valorAdquisicion")} />
                <QInput label="Valor residual" {...plan("valorResidual")} />
                <QInput label="Valor amortizable" nombre="valor_amortizable"
                    valor={importe(amortizacion.valorAmortizable)} soloLectura />
                <QInput label="Método" nombre="metodo" valor={amortizacion.metodo} soloLectura />
                <QSelect label="Periodo" opciones={PERIODOS} {...plan("periodo")} />
                <QInput label="% anual" {...plan("porcentajeAnual")} />
                <QInput label="% periodo" {...plan("porcentajePeriodo")} />
                <QInput label="Amortización del periodo" {...plan("amortizacionPeriodo")} />
                <QInput label="Nº de periodos" {...plan("numPeriodos")} />
                <QInput label="Amortización primer periodo" nombre="primer_periodo"
                    valor={importe(amortizacion.amortizacionPrimerPeriodo)} soloLectura />
                <QInput label="Amortización último periodo" nombre="ultimo_periodo"
                    valor={importe(amortizacion.amortizacionUltimoPeriodo)} soloLectura />
                <QInput label="Total amortizado" nombre="total_amortizado"
                    valor={importe(amortizacion.totalAmortizado)} soloLectura />
                <QInput label="Pendiente" nombre="pendiente"
                    valor={importe(amortizacion.pendiente)} soloLectura />
                <QCheckbox label="Bloqueado" {...uiProps("bloqueado")} />
                <QTextArea label="Notas" {...uiProps("notas")} />
            </quimera-formulario>
        </div>
    );
};

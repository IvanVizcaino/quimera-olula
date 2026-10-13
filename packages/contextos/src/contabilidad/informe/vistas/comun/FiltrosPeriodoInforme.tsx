import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import {
    FormatoCuentasAnuales,
    NivelDesgloseCuentasAnuales,
    OPCIONES_FORMATO_CUENTAS_ANUALES,
    OPCIONES_NIVEL_DESGLOSE_CUENTAS_ANUALES,
} from "../../dominio.ts";
import "#/comun/estilos/pagina_proceso.css";

export interface FiltrosPeriodoInformeProps {
    ejercicioId: string;
    fechaDesde: string;
    fechaHasta: string;
    onEjercicioId: (v: string) => void;
    onFechaDesde: (v: string) => void;
    onFechaHasta: (v: string) => void;
    /** Comparativo PGC 2008 / ECPN. */
    ejercicioAnteriorId?: string;
    onEjercicioAnteriorId?: (v: string) => void;
    /** Opciones PGC 2008 (balance / PyG / IG). */
    formato?: FormatoCuentasAnuales;
    onFormato?: (v: FormatoCuentasAnuales) => void;
    nivelDesglose?: NivelDesgloseCuentasAnuales;
    onNivelDesglose?: (v: NivelDesgloseCuentasAnuales) => void;
}

export const FiltrosPeriodoInforme = ({
    ejercicioId,
    fechaDesde,
    fechaHasta,
    onEjercicioId,
    onFechaDesde,
    onFechaHasta,
    ejercicioAnteriorId,
    onEjercicioAnteriorId,
    formato,
    onFormato,
    nivelDesglose,
    onNivelDesglose,
}: FiltrosPeriodoInformeProps) => (
    <quimera-formulario className="filtros-informe-contable">
        <QInput label="Ejercicio" nombre="ejercicio_id" valor={ejercicioId} onChange={onEjercicioId} />
        {onEjercicioAnteriorId != null && (
            <QInput
                label="Ejercicio anterior"
                nombre="ejercicio_anterior_id"
                valor={ejercicioAnteriorId ?? ""}
                onChange={onEjercicioAnteriorId}
                opcional
            />
        )}
        <QInput label="Fecha desde" nombre="fecha_desde" tipo="fecha" valor={fechaDesde} onChange={onFechaDesde} opcional />
        <QInput label="Fecha hasta" nombre="fecha_hasta" tipo="fecha" valor={fechaHasta} onChange={onFechaHasta} opcional />
        {onFormato != null && (
            <QSelect
                label="Formato"
                nombre="formato"
                valor={formato ?? "Normal"}
                opciones={OPCIONES_FORMATO_CUENTAS_ANUALES}
                onChange={(op) => onFormato((op?.valor as FormatoCuentasAnuales) || "Normal")}
            />
        )}
        {onNivelDesglose != null && (
            <QSelect
                label="Desglose"
                nombre="nivel_desglose"
                valor={nivelDesglose ?? "No desglosar"}
                opciones={OPCIONES_NIVEL_DESGLOSE_CUENTAS_ANUALES}
                onChange={(op) =>
                    onNivelDesglose((op?.valor as NivelDesgloseCuentasAnuales) || "No desglosar")
                }
            />
        )}
    </quimera-formulario>
);

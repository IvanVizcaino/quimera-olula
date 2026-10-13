import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QTabla, MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useCallback, useContext, useMemo, useState } from "react";
import { FilaBalance } from "../../diseño.ts";
import {
    criteriaInformePeriodo,
    ejercicioActual,
    FormatoCuentasAnuales,
    NivelDesgloseCuentasAnuales,
} from "../../dominio.ts";
import { getInformeBalance } from "../../infraestructura.ts";
import { BotonDescargarPdfInforme } from "../comun/BotonDescargarPdfInforme.tsx";
import { FiltrosPeriodoInforme } from "../comun/FiltrosPeriodoInforme.tsx";

const metaTablaBalance: MetaTabla<FilaBalance> = [
    { id: "codigoBalance", cabecera: "Cód. balance" },
    { id: "naturaleza", cabecera: "Naturaleza" },
    { id: "descripcion1", cabecera: "Grupo" },
    { id: "descripcionCuenta", cabecera: "Concepto" },
    { id: "saldoActual", cabecera: "Ejercicio actual", tipo: "moneda" },
    { id: "saldoAnterior", cabecera: "Ejercicio anterior", tipo: "moneda" },
    { id: "saldo", cabecera: "Saldo", tipo: "moneda" },
];

export const InformeBalance = () => {
    const { intentar } = useContext(ContextoError);
    const [ejercicioId, setEjercicioId] = useState(ejercicioActual());
    const [ejercicioAnteriorId, setEjercicioAnteriorId] = useState(() => {
        const n = Number(ejercicioActual());
        return Number.isFinite(n) ? String(n - 1) : "";
    });
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");
    const [formato, setFormato] = useState<FormatoCuentasAnuales>("Normal");
    const [nivelDesglose, setNivelDesglose] =
        useState<NivelDesgloseCuentasAnuales>("No desglosar");
    const [filas, setFilas] = useState<FilaBalance[]>([]);
    const [total, setTotal] = useState(0);
    const [cargando, setCargando] = useState(false);

    const criteria = useMemo(
        () =>
            criteriaInformePeriodo({
                ejercicioId,
                ejercicioAnteriorId,
                fechaDesde,
                fechaHasta,
                formato,
                nivelDesglose,
            }),
        [ejercicioId, ejercicioAnteriorId, fechaDesde, fechaHasta, formato, nivelDesglose]
    );

    const consultar = useCallback(async () => {
        if (!ejercicioId.trim() || cargando) return;

        setCargando(true);
        try {
            const { datos, total: t } = await intentar(() => getInformeBalance(criteria));
            setFilas(datos);
            setTotal(t);
        } finally {
            setCargando(false);
        }
    }, [cargando, criteria, ejercicioId, intentar]);

    return (
        <div className="InformeContable InformeBalance">
            <h2>Balance de situación</h2>
            <FiltrosPeriodoInforme
                ejercicioId={ejercicioId}
                ejercicioAnteriorId={ejercicioAnteriorId}
                fechaDesde={fechaDesde}
                fechaHasta={fechaHasta}
                onEjercicioId={setEjercicioId}
                onEjercicioAnteriorId={setEjercicioAnteriorId}
                onFechaDesde={setFechaDesde}
                onFechaHasta={setFechaHasta}
                formato={formato}
                onFormato={setFormato}
                nivelDesglose={nivelDesglose}
                onNivelDesglose={setNivelDesglose}
            />
            <div className="maestro-botones">
                <QBoton onClick={consultar} deshabilitado={!ejercicioId.trim() || cargando}>
                    Consultar
                </QBoton>
                <BotonDescargarPdfInforme
                    tipo="balance"
                    criteria={criteria}
                    deshabilitado={!ejercicioId.trim()}
                    ocupadoExterno={cargando}
                />
            </div>

            {(filas.length > 0 || total > 0) && (
                <QTabla
                    metaTabla={metaTablaBalance}
                    datos={filas}
                    cargando={cargando}
                    orden={["codigoCuenta", "ASC"]}
                    totalEntidades={total}
                />
            )}
        </div>
    );
};

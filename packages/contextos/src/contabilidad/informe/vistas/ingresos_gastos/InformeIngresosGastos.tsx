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
import { getInformeIngresosGastos } from "../../infraestructura.ts";
import { BotonDescargarPdfInforme } from "../comun/BotonDescargarPdfInforme.tsx";
import { FiltrosPeriodoInforme } from "../comun/FiltrosPeriodoInforme.tsx";
import "#/comun/estilos/pagina_proceso.css";

const metaTablaIg: MetaTabla<FilaBalance> = [
    { id: "naturaleza", cabecera: "Naturaleza" },
    { id: "descripcion1", cabecera: "Grupo" },
    { id: "descripcionCuenta", cabecera: "Concepto" },
    { id: "saldoActual", cabecera: "Ejercicio actual", tipo: "moneda" },
    { id: "saldoAnterior", cabecera: "Ejercicio anterior", tipo: "moneda" },
];

export const InformeIngresosGastos = () => {
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
            const { datos, total: t } = await intentar(() => getInformeIngresosGastos(criteria));
            setFilas(datos);
            setTotal(t);
        } finally {
            setCargando(false);
        }
    }, [cargando, criteria, ejercicioId, intentar]);

    return (
        <div className="InformeContable InformeIngresosGastos">
            <header className="pagina-proceso__cabecera">
                <h2>Estado de ingresos y gastos reconocidos</h2>
            </header>
            <section className="pagina-proceso__panel">
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
                        tipo="ingresos_gastos"
                        criteria={criteria}
                        deshabilitado={!ejercicioId.trim()}
                        ocupadoExterno={cargando}
                    />
                </div>
            </section>

            {(filas.length > 0 || total > 0) && (
                <QTabla
                    metaTabla={metaTablaIg}
                    datos={filas}
                    cargando={cargando}
                    orden={["codigoBalance", "ASC"]}
                    totalEntidades={total}
                />
            )}
        </div>
    );
};

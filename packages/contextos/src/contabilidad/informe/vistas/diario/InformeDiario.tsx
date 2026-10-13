import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QTabla, MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useCallback, useContext, useMemo, useState } from "react";
import { LineaDiario } from "../../diseño.ts";
import { criteriaInformePeriodo, ejercicioActual } from "../../dominio.ts";
import { getInformeDiario } from "../../infraestructura.ts";
import { BotonDescargarPdfInforme } from "../comun/BotonDescargarPdfInforme.tsx";
import { FiltrosPeriodoInforme } from "../comun/FiltrosPeriodoInforme.tsx";

const metaTablaDiario: MetaTabla<LineaDiario> = [
    { id: "fecha", cabecera: "Fecha", tipo: "fecha" },
    { id: "asientoNumero", cabecera: "Asiento", tipo: "numero" },
    { id: "conceptoAsiento", cabecera: "Concepto asiento" },
    { id: "codigoSubcuenta", cabecera: "Subcuenta" },
    { id: "concepto", cabecera: "Concepto partida" },
    { id: "debe", cabecera: "Debe", tipo: "moneda" },
    { id: "haber", cabecera: "Haber", tipo: "moneda" },
];

export const InformeDiario = () => {
    const { intentar } = useContext(ContextoError);
    const [ejercicioId, setEjercicioId] = useState(ejercicioActual());
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");
    const [filas, setFilas] = useState<LineaDiario[]>([]);
    const [total, setTotal] = useState(0);
    const [cargando, setCargando] = useState(false);

    const criteria = useMemo(
        () =>
            criteriaInformePeriodo({
                ejercicioId,
                fechaDesde,
                fechaHasta,
            }),
        [ejercicioId, fechaDesde, fechaHasta]
    );

    const consultar = useCallback(async () => {
        if (!ejercicioId.trim() || cargando) return;

        setCargando(true);
        try {
            const { datos, total: t } = await intentar(() => getInformeDiario(criteria));
            setFilas(datos);
            setTotal(t);
        } finally {
            setCargando(false);
        }
    }, [cargando, criteria, ejercicioId, intentar]);

    return (
        <div className="InformeContable InformeDiario">
            <h2>Libro diario</h2>
            <FiltrosPeriodoInforme
                ejercicioId={ejercicioId}
                fechaDesde={fechaDesde}
                fechaHasta={fechaHasta}
                onEjercicioId={setEjercicioId}
                onFechaDesde={setFechaDesde}
                onFechaHasta={setFechaHasta}
            />
            <div className="maestro-botones">
                <QBoton onClick={consultar} deshabilitado={!ejercicioId.trim() || cargando}>
                    Consultar
                </QBoton>
                <BotonDescargarPdfInforme
                    tipo="diario"
                    criteria={criteria}
                    deshabilitado={!ejercicioId.trim()}
                    ocupadoExterno={cargando}
                />
            </div>

            {(filas.length > 0 || total > 0) && (
                <QTabla
                    metaTabla={metaTablaDiario}
                    datos={filas}
                    cargando={cargando}
                    orden={["fecha", "ASC"]}
                    totalEntidades={total}
                />
            )}
        </div>
    );
};

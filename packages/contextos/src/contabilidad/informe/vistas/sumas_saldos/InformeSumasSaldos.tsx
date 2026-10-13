import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QTabla, MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useCallback, useContext, useMemo, useState } from "react";
import { FilaSumasSaldos } from "../../diseño.ts";
import { criteriaInformePeriodo, ejercicioActual } from "../../dominio.ts";
import { getInformeSumasSaldos } from "../../infraestructura.ts";
import { BotonDescargarPdfInforme } from "../comun/BotonDescargarPdfInforme.tsx";
import { FiltrosPeriodoInforme } from "../comun/FiltrosPeriodoInforme.tsx";

const metaTablaSumasSaldos: MetaTabla<FilaSumasSaldos> = [
    { id: "codigoSubcuenta", cabecera: "Subcuenta" },
    { id: "descripcionSubcuenta", cabecera: "Descripción" },
    { id: "codigoCuenta", cabecera: "Cuenta" },
    { id: "debePeriodo", cabecera: "Debe periodo", tipo: "moneda" },
    { id: "haberPeriodo", cabecera: "Haber periodo", tipo: "moneda" },
    { id: "saldoInicial", cabecera: "Saldo inicial", tipo: "moneda" },
    { id: "saldoDebe", cabecera: "Saldo debe", tipo: "moneda" },
    { id: "saldoHaber", cabecera: "Saldo haber", tipo: "moneda" },
    { id: "saldo", cabecera: "Saldo", tipo: "moneda" },
    { id: "numeroPartidas", cabecera: "Partidas" },
];

export const InformeSumasSaldos = () => {
    const { intentar } = useContext(ContextoError);
    const [ejercicioId, setEjercicioId] = useState(ejercicioActual());
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");
    const [filas, setFilas] = useState<FilaSumasSaldos[]>([]);
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
            const { datos, total: t } = await intentar(() => getInformeSumasSaldos(criteria));
            setFilas(datos);
            setTotal(t);
        } finally {
            setCargando(false);
        }
    }, [cargando, criteria, ejercicioId, intentar]);

    return (
        <div className="InformeContable InformeSumasSaldos">
            <h2>Sumas y saldos</h2>
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
                    tipo="sumas_saldos"
                    criteria={criteria}
                    deshabilitado={!ejercicioId.trim()}
                    ocupadoExterno={cargando}
                />
            </div>

            {(filas.length > 0 || total > 0) && (
                <QTabla
                    metaTabla={metaTablaSumasSaldos}
                    datos={filas}
                    cargando={cargando}
                    orden={["codigoSubcuenta", "ASC"]}
                    totalEntidades={total}
                />
            )}
        </div>
    );
};

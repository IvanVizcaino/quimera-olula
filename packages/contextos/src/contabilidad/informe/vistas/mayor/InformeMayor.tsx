import { SubcuentaSelector } from "#/contabilidad/comun/componentes/SubcuentaSelector.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QTabla, MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { formatearMoneda } from "@olula/lib/dominio.ts";
import { useCallback, useContext, useMemo, useState } from "react";
import { InformeMayor as InformeMayorModelo, LineaMayor } from "../../diseño.ts";
import { criteriaInformeMayor, ejercicioActual } from "../../dominio.ts";
import { getInformeMayor } from "../../infraestructura.ts";
import { BotonDescargarPdfInforme } from "../comun/BotonDescargarPdfInforme.tsx";
import { FiltrosPeriodoInforme } from "../comun/FiltrosPeriodoInforme.tsx";

const metaTablaMayor: MetaTabla<LineaMayor> = [
    { id: "fecha", cabecera: "Fecha", tipo: "fecha" },
    { id: "asientoNumero", cabecera: "Asiento", tipo: "numero" },
    { id: "concepto", cabecera: "Concepto" },
    { id: "debe", cabecera: "Debe", tipo: "moneda" },
    { id: "haber", cabecera: "Haber", tipo: "moneda" },
    { id: "saldo", cabecera: "Saldo", tipo: "moneda" },
];

export const InformeMayor = () => {
    const { intentar } = useContext(ContextoError);
    const [ejercicioId, setEjercicioId] = useState(ejercicioActual());
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");
    const [subcuentaId, setSubcuentaId] = useState("");
    const [subcuentaCodigo, setSubcuentaCodigo] = useState("");
    const [informe, setInforme] = useState<InformeMayorModelo | null>(null);
    const [cargando, setCargando] = useState(false);

    const criteria = useMemo(
        () =>
            criteriaInformeMayor({
                ejercicioId,
                fechaDesde,
                fechaHasta,
                subcuentaId,
            }),
        [ejercicioId, fechaDesde, fechaHasta, subcuentaId]
    );

    const consultar = useCallback(async () => {
        if (!subcuentaId || cargando) return;

        setCargando(true);
        try {
            const datos = await intentar(() => getInformeMayor(criteria));
            setInforme(datos);
        } finally {
            setCargando(false);
        }
    }, [cargando, criteria, intentar, subcuentaId]);

    const cab = informe?.cabecera;

    return (
        <div className="InformeContable InformeMayor">
            <h2>Libro mayor</h2>
            <FiltrosPeriodoInforme
                ejercicioId={ejercicioId}
                fechaDesde={fechaDesde}
                fechaHasta={fechaHasta}
                onEjercicioId={setEjercicioId}
                onFechaDesde={setFechaDesde}
                onFechaHasta={setFechaHasta}
            />
            <SubcuentaSelector
                ejercicioId={ejercicioId}
                valor={subcuentaId}
                descripcion={subcuentaCodigo}
                onChange={(op) => {
                    setSubcuentaId(op?.valor ?? "");
                    setSubcuentaCodigo(op?.descripcion ?? "");
                    setInforme(null);
                }}
            />
            <div className="maestro-botones">
                <QBoton onClick={consultar} deshabilitado={!subcuentaId || !ejercicioId.trim() || cargando}>
                    Consultar
                </QBoton>
                <BotonDescargarPdfInforme
                    tipo="mayor"
                    criteria={criteria}
                    deshabilitado={!subcuentaId || !ejercicioId.trim()}
                    ocupadoExterno={cargando}
                />
            </div>

            {cab && (
                <section className="informe-cabecera">
                    <p>
                        <strong>{cab.codigoSubcuenta}</strong> — {cab.descripcionSubcuenta}
                    </p>
                    <p>
                        Saldo inicial: {formatearMoneda(cab.saldoInicial, "EUR")} · Saldo final:{" "}
                        {formatearMoneda(cab.saldoFinal, "EUR")}
                    </p>
                </section>
            )}

            {informe && (
                <QTabla
                    metaTabla={metaTablaMayor}
                    datos={informe.lineas}
                    cargando={cargando}
                    orden={["fecha", "ASC"]}
                    totalEntidades={informe.total}
                />
            )}
        </div>
    );
};

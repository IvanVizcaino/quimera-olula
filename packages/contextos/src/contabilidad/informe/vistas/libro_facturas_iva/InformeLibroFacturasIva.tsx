import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QTabla, MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useCallback, useContext, useMemo, useState } from "react";
import { FilaLibroFacturasIva, GetInformeLibroFacturasIva, TipoInformeContableReport } from "../../diseño.ts";
import { criteriaInformePeriodo, ejercicioActual } from "../../dominio.ts";
import { BotonDescargarPdfInforme } from "../comun/BotonDescargarPdfInforme.tsx";
import { FiltrosPeriodoInforme } from "../comun/FiltrosPeriodoInforme.tsx";

const metaTabla: MetaTabla<FilaLibroFacturasIva> = [
    { id: "codigoFactura", cabecera: "Factura" },
    { id: "numeroFactura", cabecera: "Nº factura" },
    { id: "fechaAsiento", cabecera: "Fecha asiento", tipo: "fecha" },
    { id: "asientoNumero", cabecera: "Asiento" },
    { id: "codigoTercero", cabecera: "Cód. tercero" },
    { id: "nombreTercero", cabecera: "Tercero" },
    { id: "cifNif", cabecera: "CIF/NIF" },
    { id: "baseImponible", cabecera: "Base", tipo: "moneda" },
    { id: "cuotaIva", cabecera: "Cuota IVA", tipo: "moneda" },
    { id: "porcentajeIva", cabecera: "% IVA" },
    { id: "porcentajeRecargo", cabecera: "% recargo" },
    { id: "codigoContrapartida", cabecera: "Contrapartida" },
    { id: "documento", cabecera: "Documento" },
];

export interface InformeLibroFacturasIvaProps {
    titulo: string;
    tipoPdf: TipoInformeContableReport;
    consultar: GetInformeLibroFacturasIva;
    className: string;
}

export const InformeLibroFacturasIva = ({
    titulo,
    tipoPdf,
    consultar,
    className,
}: InformeLibroFacturasIvaProps) => {
    const { intentar } = useContext(ContextoError);
    const [ejercicioId, setEjercicioId] = useState(ejercicioActual());
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");
    const [filas, setFilas] = useState<FilaLibroFacturasIva[]>([]);
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

    const ejecutarConsulta = useCallback(async () => {
        if (!ejercicioId.trim() || cargando) return;

        setCargando(true);
        try {
            const { datos, total: t } = await intentar(() => consultar(criteria));
            setFilas(datos);
            setTotal(t);
        } finally {
            setCargando(false);
        }
    }, [cargando, consultar, criteria, ejercicioId, intentar]);

    return (
        <div className={`InformeContable ${className}`}>
            <h2>{titulo}</h2>
            <FiltrosPeriodoInforme
                ejercicioId={ejercicioId}
                fechaDesde={fechaDesde}
                fechaHasta={fechaHasta}
                onEjercicioId={setEjercicioId}
                onFechaDesde={setFechaDesde}
                onFechaHasta={setFechaHasta}
            />
            <div className="maestro-botones">
                <QBoton onClick={ejecutarConsulta} deshabilitado={!ejercicioId.trim() || cargando}>
                    Consultar
                </QBoton>
                <BotonDescargarPdfInforme
                    tipo={tipoPdf}
                    criteria={criteria}
                    deshabilitado={!ejercicioId.trim()}
                    ocupadoExterno={cargando}
                />
            </div>

            {(filas.length > 0 || total > 0) && (
                <QTabla
                    metaTabla={metaTabla}
                    datos={filas}
                    cargando={cargando}
                    orden={["fechaAsiento", "ASC"]}
                    totalEntidades={total}
                />
            )}
        </div>
    );
};

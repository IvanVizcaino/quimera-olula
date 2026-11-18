import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { MetaTabla, QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { descargarDocumento } from "@olula/lib/api/documentos.ts";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useCallback, useContext, useMemo, useState } from "react";
import {
    LibroDiario,
    LineaLibroDiario,
    ResultadoLibroDiario,
} from "../diseño.ts";
import { nombreFicheroLibroDiario } from "../dominio.ts";
import { getReportLibroDiario } from "../infraestructura.ts";

const COLUMNAS_BASE: MetaTabla<LineaLibroDiario> = [
    { id: "fecha", cabecera: "Fecha", tipo: "fecha" },
    { id: "asientoNumero", cabecera: "Asiento", tipo: "numero" },
    { id: "conceptoAsiento", cabecera: "Concepto asiento" },
    { id: "codigoSubcuenta", cabecera: "Subcuenta" },
    { id: "concepto", cabecera: "Concepto partida" },
    { id: "debe", cabecera: "Debe", tipo: "moneda" },
    { id: "haber", cabecera: "Haber", tipo: "moneda" },
];

const COLUMNAS_IVA: MetaTabla<LineaLibroDiario> = [
    { id: "baseImponible", cabecera: "Base", tipo: "moneda" },
    { id: "codigoSerie", cabecera: "Serie" },
    { id: "factura", cabecera: "Factura", tipo: "numero" },
    { id: "iva", cabecera: "% IVA", tipo: "numero" },
    { id: "recargo", cabecera: "% R.E.", tipo: "numero" },
];

const importe = (valor: number): string =>
    valor.toLocaleString("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

export const TabResultado = ({
    informe,
    resultado,
    emitir,
}: {
    informe: LibroDiario;
    resultado: ResultadoLibroDiario | null;
    emitir: EmitirEvento;
}) => {
    const { intentar } = useContext(ContextoError);
    const [calculando, setCalculando] = useState(false);
    const [descargando, setDescargando] = useState(false);

    const metaTabla = useMemo(
        () =>
            informe.datosIva
                ? [...COLUMNAS_BASE, ...COLUMNAS_IVA]
                : COLUMNAS_BASE,
        [informe.datosIva]
    );

    const calcular = useCallback(async () => {
        if (calculando) return;
        setCalculando(true);
        try {
            await emitir("calculo_solicitado");
        } finally {
            setCalculando(false);
        }
    }, [calculando, emitir]);

    const descargar = useCallback(async () => {
        if (descargando) return;
        setDescargando(true);
        try {
            const blob = await intentar(() => getReportLibroDiario(informe.id));
            await descargarDocumento(blob, nombreFicheroLibroDiario(informe));
        } finally {
            setDescargando(false);
        }
    }, [descargando, informe, intentar]);

    const ocupado = calculando || descargando;

    return (
        <div className="TabResultado">
            <div className="maestro-botones">
                <QBoton onClick={calcular} deshabilitado={ocupado}>
                    {calculando ? "Calculando…" : "Calcular"}
                </QBoton>
                <QBoton
                    variante="borde"
                    onClick={descargar}
                    deshabilitado={ocupado}
                >
                    Descargar PDF
                </QBoton>
            </div>

            {!resultado && <p>Pulsa «Calcular» para obtener el libro.</p>}

            {resultado && informe.resumenMensual && (
                <div className="resumen-mensual">
                    {resultado.resumenMensual.map((periodo) => (
                        <table key={periodo.indice} className="tabla-periodo">
                            <caption>{periodo.titulo}</caption>
                            <thead>
                                <tr>
                                    <th>Subcuenta</th>
                                    <th>Descripción</th>
                                    <th>Debe</th>
                                    <th>Haber</th>
                                </tr>
                            </thead>
                            <tbody>
                                {periodo.lineas.map((linea) => (
                                    <tr key={linea.codigoSubcuenta}>
                                        <td>{linea.codigoSubcuenta}</td>
                                        <td>{linea.descripcionSubcuenta}</td>
                                        <td className="importe">
                                            {importe(linea.debe)}
                                        </td>
                                        <td className="importe">
                                            {importe(linea.haber)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={2}>Total periodo</td>
                                    <td className="importe">
                                        {importe(periodo.totalDebe)}
                                    </td>
                                    <td className="importe">
                                        {importe(periodo.totalHaber)}
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={2}>Acumulado diario</td>
                                    <td className="importe">
                                        {importe(periodo.acumuladoDebe)}
                                    </td>
                                    <td className="importe">
                                        {importe(periodo.acumuladoHaber)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    ))}
                </div>
            )}

            {resultado && !informe.resumenMensual && (
                <>
                    <QTabla
                        metaTabla={metaTabla}
                        datos={resultado.datos}
                        cargando={calculando}
                        orden={["fecha", "ASC"]}
                        totalEntidades={resultado.total}
                    />

                    {resultado.totalesMes.length > 0 && (
                        <table className="tabla-totales-mes">
                            <thead>
                                <tr>
                                    <th>Mes</th>
                                    <th>Debe</th>
                                    <th>Haber</th>
                                    <th>Descuadre</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resultado.totalesMes.map((mes) => (
                                    <tr key={mes.mes}>
                                        <td>{mes.mes}</td>
                                        <td className="importe">
                                            {importe(mes.debe)}
                                        </td>
                                        <td className="importe">
                                            {importe(mes.haber)}
                                        </td>
                                        <td className="importe">
                                            {importe(mes.descuadre)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {resultado.totales && (
                        <p className="totales-diario">
                            Totales: debe {importe(resultado.totales.debe)} ·
                            haber {importe(resultado.totales.haber)} ·
                            descuadre {importe(resultado.totales.descuadre)}
                        </p>
                    )}
                </>
            )}
        </div>
    );
};

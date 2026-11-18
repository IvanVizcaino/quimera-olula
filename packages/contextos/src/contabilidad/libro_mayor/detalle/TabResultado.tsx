import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { MetaTabla, QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { descargarDocumento } from "@olula/lib/api/documentos.ts";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useCallback, useContext, useState } from "react";
import {
    LibroMayor,
    LineaLibroMayor,
    ResultadoLibroMayor,
} from "../diseño.ts";
import { nombreFicheroLibroMayor } from "../dominio.ts";
import { getReportLibroMayor } from "../infraestructura.ts";

const COLUMNAS: MetaTabla<LineaLibroMayor> = [
    { id: "fecha", cabecera: "Fecha", tipo: "fecha" },
    { id: "asientoNumero", cabecera: "Asiento", tipo: "numero" },
    { id: "concepto", cabecera: "Concepto" },
    { id: "debe", cabecera: "Debe", tipo: "moneda" },
    { id: "haber", cabecera: "Haber", tipo: "moneda" },
    { id: "saldo", cabecera: "Saldo", tipo: "moneda" },
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
    informe: LibroMayor;
    resultado: ResultadoLibroMayor | null;
    emitir: EmitirEvento;
}) => {
    const { intentar } = useContext(ContextoError);
    const [calculando, setCalculando] = useState(false);
    const [descargando, setDescargando] = useState(false);

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
            const blob = await intentar(() => getReportLibroMayor(informe.id));
            await descargarDocumento(blob, nombreFicheroLibroMayor(informe));
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

            {!resultado && <p>Pulsa «Calcular» para obtener el mayor.</p>}

            {resultado && resultado.subcuentas.length === 0 && (
                <p>No hay movimientos en el rango de la ficha.</p>
            )}

            {resultado?.subcuentas.map((bloque) => (
                <section
                    key={bloque.cabecera.codigoSubcuenta}
                    className="bloque-subcuenta"
                >
                    <h3>
                        {bloque.cabecera.codigoSubcuenta}{" "}
                        {bloque.cabecera.descripcionSubcuenta}
                    </h3>
                    <p className="saldos-subcuenta">
                        Saldo inicial {importe(bloque.cabecera.saldoInicial)} ·
                        debe {importe(bloque.totalDebe)} · haber{" "}
                        {importe(bloque.totalHaber)} · saldo final{" "}
                        {importe(bloque.cabecera.saldoFinal)}
                    </p>
                    <QTabla
                        metaTabla={COLUMNAS}
                        datos={bloque.lineas}
                        cargando={calculando}
                        orden={["fecha", "ASC"]}
                        totalEntidades={bloque.total}
                    />
                </section>
            ))}
        </div>
    );
};

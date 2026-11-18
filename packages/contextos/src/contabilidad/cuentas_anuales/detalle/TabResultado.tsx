import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { descargarDocumento } from "@olula/lib/api/documentos.ts";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useCallback, useContext, useMemo, useState } from "react";
import {
    BalanceCuentasAnuales,
    CuentasAnuales,
    FormatoHoja,
    LineaCuentasAnuales,
} from "../diseño.ts";
import {
    conceptoLinea,
    nivelLinea,
    nombreFicheroCuentasAnuales,
    subtotalesTrasLinea,
} from "../dominio.ts";
import {
    getHojaCuentasAnuales,
    getReportCuentasAnuales,
} from "../infraestructura.ts";

type TipoFila = "cabecera" | "detalle" | "desglose" | "subtotal" | "total";

interface Fila {
    tipo: TipoFila;
    nivel: number;
    concepto: string;
    saldoActual: number | null;
    saldoAnterior: number | null;
}

const importe = (valor: number | null): string =>
    valor === null
        ? ""
        : valor.toLocaleString("es-ES", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

/**
 * Aplana el balance jerárquico igual que lo hace el backend para el PDF: las
 * cabeceras de nivel solo salen cuando cambian y los subtotales se insertan
 * tras el último epígrafe al que están anclados.
 */
const filasDelBalance = (balance: BalanceCuentasAnuales): Fila[] => {
    const filas: Fila[] = [];
    const previas = ["", "", "", ""];

    balance.datos.forEach((linea: LineaCuentasAnuales, indice) => {
        const textos = [
            linea.descripcion1,
            linea.descripcion2,
            linea.descripcion3,
            linea.descripcion4,
        ];
        const nivel = nivelLinea(linea);

        for (let i = 0; i < nivel; i++) {
            const texto = (textos[i] ?? "").trim();
            if (!texto || texto === previas[i]) continue;
            filas.push({
                tipo: "cabecera",
                nivel: i,
                concepto: texto,
                saldoActual: null,
                saldoAnterior: null,
            });
            previas[i] = texto;
            for (let j = i + 1; j < previas.length; j++) previas[j] = "";
        }

        filas.push({
            tipo: "detalle",
            nivel,
            concepto: conceptoLinea(linea),
            saldoActual: linea.saldoActual,
            saldoAnterior: linea.saldoAnterior,
        });
        previas[nivel] = (textos[nivel] ?? "").trim();

        linea.desglose.forEach((d) =>
            filas.push({
                tipo: "desglose",
                nivel: 4,
                concepto: `${d.clave} ${d.descripcion}`.trim(),
                saldoActual: d.saldoActual,
                saldoAnterior: d.saldoAnterior,
            })
        );

        subtotalesTrasLinea(
            balance.subtotales,
            linea,
            balance.datos[indice + 1]
        ).forEach((s) =>
            filas.push({
                tipo: "subtotal",
                nivel: 0,
                concepto: s.descripcion,
                saldoActual: s.saldoActual,
                saldoAnterior: s.saldoAnterior,
            })
        );
    });

    balance.totalesGrupo.forEach((t) =>
        filas.push({
            tipo: "total",
            nivel: 0,
            concepto: t.descripcion,
            saldoActual: t.saldoActual,
            saldoAnterior: t.saldoAnterior,
        })
    );

    return filas;
};

export const TabResultado = ({
    informe,
    balance,
    emitir,
}: {
    informe: CuentasAnuales;
    balance: BalanceCuentasAnuales | null;
    emitir: EmitirEvento;
}) => {
    const { intentar } = useContext(ContextoError);
    const [calculando, setCalculando] = useState(false);
    const [descargando, setDescargando] = useState(false);

    const filas = useMemo(
        () => (balance ? filasDelBalance(balance) : []),
        [balance]
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

    const descargar = useCallback(
        async (extension: "pdf" | FormatoHoja) => {
            if (descargando) return;
            setDescargando(true);
            try {
                const blob = await intentar(() =>
                    extension === "pdf"
                        ? getReportCuentasAnuales(informe.id)
                        : getHojaCuentasAnuales(informe.id, extension)
                );
                await descargarDocumento(
                    blob,
                    nombreFicheroCuentasAnuales(informe, extension)
                );
            } finally {
                setDescargando(false);
            }
        },
        [descargando, informe, intentar]
    );

    const ocupado = calculando || descargando;

    return (
        <div className="TabResultado">
            <div className="maestro-botones">
                <QBoton onClick={calcular} deshabilitado={ocupado}>
                    {calculando ? "Calculando…" : "Calcular"}
                </QBoton>
                <QBoton
                    variante="borde"
                    onClick={() => descargar("pdf")}
                    deshabilitado={ocupado}
                >
                    Descargar PDF
                </QBoton>
                <QBoton
                    variante="borde"
                    onClick={() => descargar("xlsx")}
                    deshabilitado={ocupado}
                >
                    Descargar Excel
                </QBoton>
                <QBoton
                    variante="borde"
                    onClick={() => descargar("ods")}
                    deshabilitado={ocupado}
                >
                    Descargar ODS
                </QBoton>
            </div>

            {balance && balance.avisosSinCodigoBalance.length > 0 && (
                <p className="aviso">
                    Hay {balance.avisosSinCodigoBalance.length} subcuenta(s) con
                    movimiento cuya cuenta no está asignada a ninguna línea del
                    modelo, por lo que sus importes no figuran en el informe:{" "}
                    {balance.avisosSinCodigoBalance
                        .slice(0, 10)
                        .map((a) => a.codigoSubcuenta)
                        .join(", ")}
                    {balance.avisosSinCodigoBalance.length > 10 ? "…" : ""}
                </p>
            )}

            {!balance && <p>Pulsa «Calcular» para obtener los importes.</p>}

            {balance && (
                <table className="tabla-cuentas-anuales">
                    <thead>
                        <tr>
                            <th>Concepto</th>
                            <th>{informe.ejercicioId || "Actual"}</th>
                            <th>{informe.ejercicioAnteriorId || "Anterior"}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filas.map((fila, indice) => (
                            <tr key={indice} className={`fila-${fila.tipo}`}>
                                <td style={{ paddingLeft: `${fila.nivel}rem` }}>
                                    {fila.concepto}
                                </td>
                                <td className="importe">
                                    {importe(fila.saldoActual)}
                                </td>
                                <td className="importe">
                                    {importe(fila.saldoAnterior)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

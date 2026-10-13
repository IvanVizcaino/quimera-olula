import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext, useState } from "react";
import { ResultadoRecalculoSaldos } from "../diseño.ts";
import { mensajeRecalculoSaldos } from "../dominio.ts";
import { patchRecalcularSaldosSubcuentas } from "../infraestructura.ts";
import "#/comun/estilos/pagina_proceso.css";

/**
 * Eneboo «Recalcula y actualiza los saldos de las subcuentas» (mt_procesos
 * actualizarSaldos / arreglaDebeHaberSaldoSubcuentas).
 */
export const RecalcularSaldosSubcuentas = () => {
    const { intentar } = useContext(ContextoError);
    const [ejercicioId, setEjercicioId] = useState("");
    const [confirmando, setConfirmando] = useState(false);
    const [procesando, setProcesando] = useState(false);
    const [resultado, setResultado] = useState<ResultadoRecalculoSaldos | null>(null);

    const ejecutar = async () => {
        setProcesando(true);
        try {
            const r = await intentar(() =>
                patchRecalcularSaldosSubcuentas(ejercicioId.trim() || undefined)
            );
            setResultado(r);
        } finally {
            setProcesando(false);
            setConfirmando(false);
        }
    };

    return (
        <div className="InformeContable RecalcularSaldosSubcuentas">
            <header className="pagina-proceso__cabecera">
                <h2>Recalcular saldos de subcuentas</h2>
                <p className="pagina-proceso__intro">
                    Recalcula debe, haber y saldo de las subcuentas a partir de sus partidas.
                    Sin ejercicio, se procesan todos los ejercicios abiertos.
                </p>
            </header>
            <section className="pagina-proceso__panel">
                <quimera-formulario>
                    <QInput
                        label="Ejercicio (opcional)"
                        nombre="ejercicio_id"
                        valor={ejercicioId}
                        onChange={(v) => setEjercicioId(v)}
                    />
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={() => setConfirmando(true)} deshabilitado={procesando}>
                        {procesando ? "Procesando…" : "Recalcular saldos"}
                    </QBoton>
                </div>
            </section>

            {confirmando && (
                <QModalConfirmacion
                    nombre="confirmarRecalcularSaldos"
                    abierto={true}
                    titulo="Recalcular saldos"
                    mensaje={
                        ejercicioId.trim()
                            ? `Se recalcularán los saldos de las subcuentas del ejercicio ${ejercicioId.trim()}.\n¿Desea continuar?`
                            : "Se recalcularán los saldos de las subcuentas de todos los ejercicios abiertos.\n¿Desea continuar?"
                    }
                    onCerrar={() => setConfirmando(false)}
                    onAceptar={ejecutar}
                />
            )}

            {resultado && (
                <section className="resultado-recalculo-saldos">
                    <p role="status">{mensajeRecalculoSaldos(resultado)}</p>
                    <p>Ejercicios: {resultado.ejercicios.join(", ") || "—"}</p>
                    {resultado.corregidas.length > 0 && (
                        <table>
                            <thead>
                                <tr>
                                    <th>Ejercicio</th>
                                    <th>Subcuenta</th>
                                    <th>Debe antes</th>
                                    <th>Haber antes</th>
                                    <th>Debe</th>
                                    <th>Haber</th>
                                    <th>Saldo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resultado.corregidas.map((c) => (
                                    <tr key={c.id}>
                                        <td>{c.ejercicioId}</td>
                                        <td>{c.codigo}</td>
                                        <td>{c.debeAntes}</td>
                                        <td>{c.haberAntes}</td>
                                        <td>{c.debe}</td>
                                        <td>{c.haber}</td>
                                        <td>{c.saldo}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>
            )}
        </div>
    );
};

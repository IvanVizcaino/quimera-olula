import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { DerechoLimite, PlanCatalogo } from "../diseño.ts";
import { importeEuros, textoCuota, textoEfecto, textoExceso } from "../dominio.ts";
import { EstadoPresupuesto } from "./presupuesto.ts";

export const PresupuestoCambio = ({
    estado, plan, limites, puedeConfirmar, enviando, onConfirmar,
}: {
    estado: EstadoPresupuesto;
    plan: PlanCatalogo;
    limites: DerechoLimite[];
    puedeConfirmar: boolean;
    enviando: boolean;
    onConfirmar: () => void;
}) => {
    const { presupuesto: p, calculando, error } = estado;

    return (
        <div className="susc-presupuesto" aria-live="polite">
            <h4>Resumen del cambio</h4>

            {calculando && <p className="susc-secundario">Calculando…</p>}

            {error && !calculando && <QAviso variante="error">{error}</QAviso>}

            {p && !calculando && (
                <>
                    <p className="susc-cuotas">
                        {p.cuotaActual && (
                            <>
                                <span className="susc-cuota-actual">{textoCuota(p.cuotaActual)}</span>
                                <span aria-hidden="true"> → </span>
                                <span className="susc-sr">pasa a </span>
                            </>
                        )}
                        <strong className="susc-cuota-nueva">{textoCuota(p.cuotaNueva)}</strong>
                        <span className="susc-secundario"> (sin IVA)</span>
                    </p>

                    <table className="susc-desglose-tabla">
                        <tbody>
                            {p.cuotaNueva.lineas.map((l) => (
                                <tr key={`${l.tipo}-${l.refId}`}>
                                    <td>{l.concepto}{l.cantidad > 1 ? ` x ${l.cantidad}` : ""}</td>
                                    <td className="susc-importe">{importeEuros(l.importe)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <p>{textoEfecto(p)}</p>

                    {p.excesos.length > 0 && (
                        <QAviso variante="error">
                            <ul>
                                {p.excesos.map((e) => (
                                    <li key={e.limiteId}>
                                        {textoExceso(e, plan.nombre, limites.find((l) => l.id === e.limiteId))}
                                    </li>
                                ))}
                            </ul>
                        </QAviso>
                    )}

                    {p.avisos.map((aviso) => (
                        <QAviso key={aviso} variante="info">{aviso}</QAviso>
                    ))}
                </>
            )}

            {!p && !calculando && !error && (
                <p className="susc-secundario">Elige otro plan, periodicidad o complementos para ver cuánto costaría.</p>
            )}

            <QBoton onClick={onConfirmar} deshabilitado={!puedeConfirmar || calculando || enviando}>
                {enviando ? "Aplicando…" : "Confirmar cambio"}
            </QBoton>
        </div>
    );
};

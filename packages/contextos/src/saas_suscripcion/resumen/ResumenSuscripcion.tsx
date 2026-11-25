import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { MiSuscripcion } from "../diseño.ts";
import {
    estadoVisible, fechaCorta, importeEuros, textoCambioProgramado, textoCuota, usoLimite,
} from "../dominio.ts";
import { Catalogo } from "../diseño.ts";

/** Texto de la próxima cuota según el estado de la suscripción. */
const proximaCuota = (mi: MiSuscripcion): string | null => {
    const s = mi.suscripcion!;
    if (!mi.cuota || s.estado === "finalizada") return null;
    if (s.cancelarAlFin) return "No habrá más cuotas: tu suscripción termina al final del periodo.";
    if (s.estado === "prueba") {
        return `Tu primera cuota será de ${textoCuota(mi.cuota)} y se cobrará el ${fechaCorta(s.finPrueba ?? s.finPeriodo)}.`;
    }
    if (s.estado === "impagada") return `Tienes pendiente la cuota de ${importeEuros(mi.cuota.total)}.`;
    return `Próxima cuota: ${textoCuota(mi.cuota)}, el ${fechaCorta(s.finPeriodo)}.`;
};

export const ResumenSuscripcion = ({ mi, catalogo }: { mi: MiSuscripcion; catalogo: Catalogo | null }) => {
    const s = mi.suscripcion!;
    const estado = estadoVisible(s);
    const proxima = proximaCuota(mi);
    const programado = textoCambioProgramado(s, catalogo);
    const usos = mi.derechos.limites.map(usoLimite);

    return (
        <section className="susc-seccion" aria-labelledby="susc-resumen">
            <h3 id="susc-resumen">Tu plan</h3>
            <div className="susc-plan-actual">
                <strong className="susc-plan-nombre">{mi.plan?.nombre ?? s.planId}</strong>
                <QEtiqueta variante={estado.variante} tamaño="md">{estado.texto}</QEtiqueta>
                <span className="susc-secundario">Facturación {s.periodicidad}</span>
            </div>

            {proxima && <p>{proxima}</p>}
            {programado && <p className="susc-programado">{programado}</p>}

            {mi.cuota && mi.cuota.lineas.length > 0 && (
                <details className="susc-desglose">
                    <summary>Ver desglose de la cuota</summary>
                    <table>
                        <tbody>
                            {mi.cuota.lineas.map((l) => (
                                <tr key={`${l.tipo}-${l.refId}`}>
                                    <td>{l.concepto}{l.cantidad > 1 ? ` x ${l.cantidad}` : ""}</td>
                                    <td className="susc-importe">{importeEuros(l.importe)}</td>
                                </tr>
                            ))}
                            {Number(mi.cuota.descuento) > 0 && (
                                <tr>
                                    <td>Descuento</td>
                                    <td className="susc-importe">-{importeEuros(mi.cuota.descuento)}</td>
                                </tr>
                            )}
                            <tr className="susc-total">
                                <td>Total (sin IVA)</td>
                                <td className="susc-importe">{importeEuros(mi.cuota.total)}</td>
                            </tr>
                        </tbody>
                    </table>
                </details>
            )}

            {usos.length > 0 && (
                <>
                    <h4>Uso de tu plan</h4>
                    <ul className="susc-usos">
                        {usos.map((u) => (
                            <li key={u.id}>
                                <div className="susc-uso-cabecera">
                                    <span>{u.nombre}</span>
                                    <span className="susc-secundario">{u.texto}</span>
                                </div>
                                {u.porcentaje !== null && (
                                    <div
                                        className={`susc-barra ${u.nivel}`}
                                        role="progressbar"
                                        aria-label={u.nombre}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-valuenow={u.porcentaje}
                                    >
                                        <div style={{ width: `${u.porcentaje}%` }} />
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </section>
    );
};

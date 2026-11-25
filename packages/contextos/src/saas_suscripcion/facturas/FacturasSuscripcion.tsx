import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { Factura } from "../diseño.ts";
import { estadoFactura, periodoFactura, totalFactura } from "../dominio.ts";

export const FacturasSuscripcion = ({ facturas }: { facturas: Factura[] }) => (
    <section className="susc-seccion" aria-labelledby="susc-facturas">
        <h3 id="susc-facturas">Facturas</h3>
        {facturas.length === 0 ? (
            <p className="susc-secundario">Todavía no tienes facturas. Aparecerán aquí cuando se cobre tu primera cuota.</p>
        ) : (
            <div className="susc-tabla-wrap">
                <table className="susc-tabla">
                    <thead>
                        <tr>
                            <th>Periodo</th>
                            <th>Concepto</th>
                            <th className="susc-importe">Total (IVA incl.)</th>
                            <th>Estado</th>
                            <th>Factura</th>
                        </tr>
                    </thead>
                    <tbody>
                        {facturas.map((f) => {
                            const estado = estadoFactura(f);
                            return (
                                <tr key={f.id}>
                                    <td>{periodoFactura(f)}</td>
                                    <td>{f.concepto}</td>
                                    <td className="susc-importe">{totalFactura(f)}</td>
                                    <td><QEtiqueta variante={estado.variante}>{estado.texto}</QEtiqueta></td>
                                    <td>
                                        {f.numeroFactura ?? "—"}
                                        {f.urlPdf && (
                                            <>
                                                {" "}
                                                <a href={f.urlPdf} target="_blank" rel="noreferrer">Descargar PDF</a>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        )}
    </section>
);

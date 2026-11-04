import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { formatearFechaString } from "@olula/lib/dominio.ts";
import { RegularizacionStock } from "../../diseño.ts";

const numero = (n: number) => n.toLocaleString("es-ES");

/** Regularizaciones del stock, la más reciente primero. */
export const RegularizacionesStock = ({
    regularizaciones,
    onBorrar,
}: {
    regularizaciones: RegularizacionStock[];
    onBorrar: (regularizacion: RegularizacionStock) => void;
}) => (
    <details className="DetalleStock-regularizaciones" open={regularizaciones.length > 0}>
        <summary>Regularizaciones ({regularizaciones.length})</summary>
        <table>
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Inicial</th>
                    <th>Final</th>
                    <th>Motivo</th>
                    <th>Inventario</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {regularizaciones.map((r) => (
                    <tr key={r.id}>
                        <td>{formatearFechaString(r.fecha)}</td>
                        <td>{r.hora}</td>
                        <td>{numero(r.cantidadInicial)}</td>
                        <td>{numero(r.cantidadFinal)}</td>
                        <td>{r.motivo ?? ""}</td>
                        <td>{r.inventarioId ?? ""}</td>
                        <td>
                            <QBoton tamaño="pequeño" variante="texto" onClick={() => onBorrar(r)}>
                                Borrar
                            </QBoton>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </details>
);
